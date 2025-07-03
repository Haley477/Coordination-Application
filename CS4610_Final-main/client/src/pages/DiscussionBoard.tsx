import { useEffect, useState, useRef } from "react";
import {
  socket,
  joinDiscussionBoard,
  leaveDiscussionBoard,
  sendChatMessage,
  sendTypingIndicator,
  DiscussionPost,
} from "../socket";
import axios from "axios";
import "../styles/DiscussionBoard.css";
import { useAuth } from "../context/AuthContext";
import FileUploadButton from "../components/FileUploadButton";

interface Project {
  id: string;
  name: string;
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  createdById: string;
  createdBy: {
    id: string;
    username: string;
  };
}

function DiscussionBoard() {
  const { user, loading: authLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<DiscussionPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [showFileInput, setShowInput] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/projects");
        setProjects(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, authLoading]);

  useEffect(() => {
    if (!selectedProject) return;

    const fetchBoards = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/discussions/project/${selectedProject}/boards`
        );
        setBoards(response.data);
        setSelectedBoard("");
        setMessages([]);
      } catch (error) {
        console.error("Error fetching discussion boards:", error);
      }
    };

    fetchBoards();
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedBoard) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/discussions/boards/${selectedBoard}/posts`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    // Join the socket room for the selected board
    socket.connect();
    joinDiscussionBoard(selectedBoard);

    return () => {
      if (selectedBoard) {
        leaveDiscussionBoard(selectedBoard);
      }
    };
  }, [selectedBoard]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onChatMessage(message: DiscussionPost) {
      setMessages((prevMessages) => [...prevMessages, message]);
      // This clean up is to ensure that if a user sends a message, their typing indicator is removed
      if (typingUsers[message.userId]) {
        const newTypingUsers = { ...typingUsers };
        delete newTypingUsers[message.userId];
        setTypingUsers(newTypingUsers);

        if (typingTimeoutRef.current[message.userId]) {
          clearTimeout(typingTimeoutRef.current[message.userId]);
          delete typingTimeoutRef.current[message.userId];
        }
      }
    }

    function onTypingIndicator(data: { 
      userId: string; 
      username: string; 
      isTyping: boolean;
     }) {
      const { userId, username, isTyping } = data;

      if (isTyping) {
        setTypingUsers((prev) => ({ ...prev, [userId]: username }));
        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
        }

        typingTimeoutRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const newTypingUsers = { ...prev };
            delete newTypingUsers[userId];
            return newTypingUsers;
          });
          delete typingTimeoutRef.current[userId];
        }, 3000);
      } else {
        setTypingUsers((prev) => {
          const newTypingUsers = { ...prev };
          delete newTypingUsers[userId];
          return newTypingUsers;
        });

        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
          delete typingTimeoutRef.current[userId];
        }
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", onChatMessage);
    socket.on("typing", onTypingIndicator);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat-message", onChatMessage);
      socket.off("typing", onTypingIndicator);

      Object.values(typingTimeoutRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
      typingTimeoutRef.current = {};
    };
  }, [typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);

    // Send the typing indicator if the user is typing and connected to a board
    if (user && selectedBoard && isConnected) {
      sendTypingIndicator(
        selectedBoard, 
        user.id, 
        user.username, 
        newInput.length > 0
      );
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // IMPORTANT: creates data URL
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && !file || !selectedBoard || !user?.id) return;

    const content = input.trim();
    const fileName = file?.name;
    const fileUrl = file ? await fileToBase64(file) : undefined;
    const boardId = selectedBoard;
    const userId = user?.id;

    if (selectedBoard && user?.id) {
      if (content == null) {
        console.error("Message content is null or undefined.");
        return;
      } 
      console.log("Sending message:", {
        boardId,
        userId,
        content,
        fileName,
        fileUrl,
      });
      sendChatMessage(boardId, userId, content, fileName, fileUrl);
    }

    setInput("");
    setFile(null);
    setShowInput(false);
    setButtonHovered(false);

    // Send the typing stopped indicator
    if (selectedBoard && isConnected) {
      sendTypingIndicator(selectedBoard, user.id, user.username, false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !newBoardName || !user?.id) return;

    setIsCreatingBoard(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/discussions/boards",
        {
          projectId: selectedProject,
          name: newBoardName,
          description: newBoardDescription,
          createdById: user.id,
        }
      );
      // Add the new board to the list of boards
      setBoards((prevBoards) => [...prevBoards, response.data]);

      setSelectedBoard(response.data.id);

      setNewBoardName("");
      setNewBoardDescription("");
      setShowNewBoardForm(false);
    } catch (error) {
      console.error("Error creating discussion board:", error);
      alert("Failed to create discussion board. Please try again.");
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (authLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access the discussion board.</div>;
  }

  const handleButtonClick = () => {
    setShowInput(!showFileInput);
  }

  return (
    <div id="discussion-board">
      <h1>Discussion Board</h1>
      <p>Welcome to the discussion board, {user.username}!</p>

      <div className="project-selection">
        <label htmlFor="project-select">Select Project:</label>
        <select
          id="project-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">-- Select a Project --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          <div className="board-selection">
          <div className="board-header">
              <label htmlFor="board-select">Select Discussion Board:</label>
              <button
                type="button"
                className="new-board-btn"
                onClick={() => setShowNewBoardForm(!showNewBoardForm)}
              >
                {showNewBoardForm ? "Cancel" : "New Board"}
              </button>
            </div>

            {showNewBoardForm ? (
              <form className="new-board-form" onSubmit={handleCreateBoard}>
                <div className="form-group">
                  <label htmlFor="board-name">Board Name:</label>
                  <input
                    id="board-name"
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Enter board name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="board-description">
                    Description (optional):
                  </label>
                  <textarea
                    id="board-description"
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    placeholder="Enter board description"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="submit"
                    className="create-board-btn"
                    disabled={isCreatingBoard || !newBoardName}
                  >
                    {isCreatingBoard ? "Creating..." : "Create Board"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowNewBoardForm(false);
                      setNewBoardName("");
                      setNewBoardDescription("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <select
                id="board-select"
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
              >
                <option value="">-- Select a Board --</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </>
      )}

      {selectedBoard && (
        <div className="message-container">
          <div className="connection-status">
            {isConnected ? (
              <span className="connected">Connected</span>
            ) : (
              <span className="disconnected">Disconnected</span>
            )}
          </div>
          <div className="messages">
            {messages.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${
                    message.userId == user.id ? "own-message" : ""
                    }`}>
                  <div className="message-header">
                  <strong>
                      {message.user.firstName && message.user.lastName
                        ? `${message.user.firstName} ${message.user.lastName} (${message.user.username})`
                        : message.user.username}
                    </strong>
                    <span className="timestamp">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                    {message.fileUrl && (
                      <div className="file-attachment">
                        {console.log("File URL:", message.fileUrl)}
                        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                          {message.fileName}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

             {/* Typing indicator */}
             {Object.keys(typingUsers).length > 0 && (
              <div className="typing-indicator">
                {Object.keys(typingUsers).length === 1
                  ? `${typingUsers[Object.keys(typingUsers)[0]]} is typing...`
                  : `${Object.keys(typingUsers).length} people are typing...`}
              </div>
            )}
          </div>

          <form className="message-form" onSubmit={handleSendMessage}>
            <div className="pick-input-container">
                <button 
                className={`add-image ${showFileInput ? "remove-image" : ""} ${buttonHovered ? "add-image-hovered" : ""}`}
                onMouseEnter={() => setButtonHovered(true)}
                onMouseLeave={() => setButtonHovered(false)}
                onClick={handleButtonClick}
                >
                {showFileInput ? "-" : (buttonHovered ? "add file" : "+")}
                </button>
              { !showFileInput ? (
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  disabled={!isConnected}
                />
            ) : (
              <input
                type="file"
                onChange={handleFileChange}
                disabled={!isConnected}
                className="file-input"
              />
            )}
          </div>
            
            <button type="submit" disabled={!isConnected || (!input.trim() && !file)}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default DiscussionBoard;
