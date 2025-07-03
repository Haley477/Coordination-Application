import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";

export interface DiscussionPost {
  id: string;
  boardId: string;
  userId: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

// Create socket connection
export const socket: Socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Socket connection events for logging
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

// Join a specific discussion board
export const joinDiscussionBoard = (boardId: string): void => {
  socket.emit("join-board", boardId);
};

// Leave a discussion board
export const leaveDiscussionBoard = (boardId: string): void => {
  socket.emit("leave-board", boardId);
};

// Send a chat message
export const sendChatMessage = (
  boardId: string,
  userId: string,
  content: string,
  fileName?: string,
  fileData?: string
): void => {
  socket.emit("chat-message", { boardId, userId, content, fileName, fileData });
};

// Send typing indicator for server
export const sendTypingIndicator = (
  boardId: string,
  userId: string,
  username: string,
  isTyping: boolean
): void => {
  socket.emit("typing", { boardId, userId, username, isTyping });
};

export default {
  socket,
  joinDiscussionBoard,
  leaveDiscussionBoard,
  sendChatMessage,
  sendTypingIndicator,
};
