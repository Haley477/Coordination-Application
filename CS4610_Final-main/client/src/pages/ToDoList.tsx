import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Todo.css";
import { useAuth } from "../context/AuthContext";

// Define interfaces based on your Prisma schema
interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface Project {
  id: string;
  name: string;
}

interface TodoList {
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

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedToId?: string;
  assignedTo?: User;
  createdById: string;
  createdBy: User;
  listId: string;
  dueDate?: string;
  isInReview: boolean;
  reviewedById?: string;
  reviewedBy?: User;
}

function ToDoList() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [activeList, setActiveList] = useState<TodoList | null>(null);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Todo creation
  const [creationPopup, setCreationPopup] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [priorityInput, setPriorityInput] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [assigneeInput, setAssigneeInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");
  const [projectMembers, setProjectMembers] = useState<User[]>([]);

  // Todo edit and remove
  const [editPopup, setEditPopup] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [deleteItem, setDeleteItem] = useState(false);

  // Load projects on component mount
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

  // When a project is selected, automatically get or create a todo list
  useEffect(() => {
    if (!selectedProject || !user?.id) return;

    const fetchOrCreateTodoList = async () => {
      try {
        // Try to fetch an existing todo list for this project
        const response = await axios.get(
          `http://localhost:3000/api/todos/lists?projectId=${selectedProject}`
        );
        
        if (response.data && response.data.length > 0) {
          // Use the first list if it exists
          setActiveList(response.data[0]);
        } else {
          // Create a new list for this project if none exists
          const newListResponse = await axios.post(
            "http://localhost:3000/api/todos/lists",
            {
              projectId: selectedProject,
              name: "Project Tasks", // Default name
              description: "Tasks for this project",
              createdById: user.id,
            }
          );
          setActiveList(newListResponse.data);
        }
        
        // Now fetch project members
        const membersResponse = await axios.get(
          `http://localhost:3000/api/projects/${selectedProject}/members`
        );
        
        // Debug logging - check what data we're receiving
        console.log("Project members response:", membersResponse.data);
        
        // Ensure each member has an id and username
        if (Array.isArray(membersResponse.data)) {
          // Make sure each member has the required fields
          const validMembers = membersResponse.data.filter(member => 
            member && typeof member === 'object' && member.id && member.username
          );
          
          setProjectMembers(validMembers);
          console.log("Valid project members:", validMembers);
        } else {
          console.error("Project members data is not an array:", membersResponse.data);
          setProjectMembers([]);
        }
      } catch (error) {
        console.error("Error setting up todo list:", error); //                     !! delete later !!
      }
    };

    fetchOrCreateTodoList();
  }, [selectedProject, user?.id]);

  // Load todo items when the active list changes
  useEffect(() => {
    if (!activeList) return;

    const fetchTodoItems = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/todos/lists/${activeList.id}`
        );
        setTodoItems(response.data.items || []);
      } catch (error) {
        console.error("Error fetching todo items:", error);
      }
    };

    fetchTodoItems();
  }, [activeList]);

  // Create new todo item
  const createTodoItem = async () => {
    if (!activeList || !taskInput || !user?.id) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/todos/items",
        {
          listId: activeList.id,
          title: taskInput,
          description: descriptionInput,
          priority: priorityInput,
          assignedToId: assigneeInput || undefined,
          createdById: user.id,
          dueDate: dueDateInput || undefined,
          status: "TODO"
        }
      );

      // Add the new item to our local state
      setTodoItems((prevItems) => [...prevItems, response.data]);

      // Reset form
      setTaskInput("");
      setDescriptionInput("");
      setPriorityInput("MEDIUM");
      setAssigneeInput("");
      setDueDateInput("");
    } catch (error) {
      console.error("Error creating todo item:", error);
      alert("Failed to create todo item. Please try again.");
    }
  };

  // Edit todo item
  const editTodoItem = async () => {
    if (!activeList || !taskInput || !user?.id) return;

    try {

      const itemId = selectedTodo?.id || "";

      if (deleteItem) {
        console.log("Deleting item...");
        setDeleteItem(false);

        const response = await axios.delete(
          `http://localhost:3000/api/todos/items/${itemId}`
        )

        // Remove the item from our local state
        setTodoItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
      }
      else {
        console.log("Editing item...")
        const response = await axios.put(
          `http://localhost:3000/api/todos/items/${itemId}`,
          {
            title: taskInput,
            description: descriptionInput,
            priority: priorityInput,
            assignedToId: assigneeInput || undefined,
            dueDate: dueDateInput || undefined,
          }
        );

        // Update the item in our local state
        setTodoItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, ...response.data } : item
          )
        );
      }

    } catch (error) {
      console.error("Error editing or removing todo item:", error);
      alert("Failed to edit or remove todo item. Please try again.");
    }
  }

  // Update todo item status (for drag and drop)
  const updateTodoItemStatus = async (itemId: string, newStatus: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED") => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/todos/items/${itemId}`,
        {
          status: newStatus,
          isInReview: newStatus === "REVIEW"
        }
      );

      // Update the item in our local state
      setTodoItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, ...response.data } : item
        )
      );
    } catch (error) {
      console.error("Error updating todo item:", error);
      alert("Failed to update todo item. Please try again.");
    }
  };

  function openCreationPopup() {
    setCreationPopup(true);
    document.querySelector('.overlay')?.classList.add('active');
  }
  function closeCreationPopup() {
    setCreationPopup(false);
    document.querySelector('.overlay')?.classList.remove('active');
  }

  function openEditPopup(todo: TodoItem) {
    setEditPopup(true);
    setSelectedTodo(todo);
    setTaskInput(todo.title);
    setDescriptionInput(todo.description || "");
    setPriorityInput(todo.priority);
    setAssigneeInput(todo.assignedToId || "");
    setDueDateInput(todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : "");

    document.querySelector('.overlay')?.classList.add('active');
  }
  function closeEditPopup() {
    setEditPopup(false);
    document.querySelector('.overlay')?.classList.remove('active');
  }

  // Drag handlers
  function handleDragStart(e: React.DragEvent<HTMLDivElement>, todoId: string, sourceStatus: string) {
    e.dataTransfer.setData("todoId", todoId);
    e.dataTransfer.setData("sourceStatus", sourceStatus);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent<HTMLElement>, targetStatus: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED") {
    e.preventDefault();
    
    const todoId = e.dataTransfer.getData("todoId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    
    // Ensure the event target is an HTMLDivElement
    const target = e.currentTarget as HTMLDivElement;

    // Skip if source and target are the same
    if (sourceStatus === targetStatus) return;
    
    // Update the todo item status via API
    updateTodoItemStatus(todoId, targetStatus);
  }

  // Filter todo items by status
  const todoItems_TODO = todoItems.filter(item => item.status === "TODO");
  const todoItems_IN_PROGRESS = todoItems.filter(item => item.status === "IN_PROGRESS");
  const todoItems_REVIEW = todoItems.filter(item => item.status === "REVIEW");
  const todoItems_COMPLETED = todoItems.filter(item => item.status === "COMPLETED");

  // Format date from year-month-day --> month/day/year
  const formatDate = (date: string) => {
    const unformatted = new Date(date).toISOString().split("T")[0]
    const [year, month, day] = unformatted.split("-");
    return `${month}/${day}/${year}`;
  }

  // Render the todo item with drag functionality
  const renderTodoItem = (todo: TodoItem) => (
    <div 
      key={todo.id} 
      className="todo-item"
      draggable
      onDragStart={(e) => handleDragStart(e, todo.id, todo.status)}

      onClick={() => {openEditPopup(todo)}}
      title="Click to edit"
    >
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        {todo.description && <div className="todo-description">{todo.description}</div>}
        <div className="todo-meta">
          <span className={`todo-priority priority-${todo.priority.toLowerCase()}`}>
            {todo.priority}
          </span>
          {todo.assignedTo && (
            <span className="todo-assignee">
              Assigned to: {todo.assignedTo.username}
            </span>
          )}
          {todo.dueDate && (
            <span className="todo-due-date">
              Due: {formatDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (authLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access the todo list.</div>;
  }



  return (
    <div className="screen">
      <h1>To-Do List</h1>
      
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

      {activeList && (
        <>
          
          <button className="open-creation-popup" onClick={openCreationPopup}>Create To-do Item</button>
          
          <div className="overlay"></div>
          {creationPopup && (
            <div className="popup">
              <button className="close-popup" onClick={closeCreationPopup}>x</button>
              <h2>Create To-Do Item</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                createTodoItem();
                closeCreationPopup();
              }}>
                <div className="form-group">
                  <label htmlFor="todo-title">Title:</label>
                  <input 
                    type="text" 
                    id="todo-title" 
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Enter title"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-description">Description (optional):</label>
                  <textarea 
                    id="todo-description" 
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-priority">Priority:</label>
                  <select
                    id="todo-priority"
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-assignee">Assign To:</label>
                  <select
                    id="todo-assignee"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                  >
                    <option value="">-- Unassigned --</option>
                    {projectMembers && projectMembers.length > 0 ? (
                      projectMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.username || `User ${member.id}`}
                        </option>
                      ))
                    ) : (
                      <option disabled value="">No project members found</option>
                    )}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-due-date">Due Date (optional):</label>
                  <input 
                    type="date" 
                    id="todo-due-date" 
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                  />
                </div>
                
                <button className="create-item" type="submit">Create</button>
              </form>
            </div>
          )}

          {/* Triggered when Todo item clicked */}
          {editPopup && (
            <div className="popup">
              <button className="close-popup" onClick={closeEditPopup}>x</button>
              <h2>Edit To-Do Item</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                editTodoItem();
                closeEditPopup();
              }}>
                <div className="form-group">
                  <label htmlFor="todo-title">Title:</label>
                  <input 
                    type="text" 
                    id="todo-title" 
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Enter title"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-description">Description (optional):</label>
                  <textarea 
                    id="todo-description" 
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-priority">Priority:</label>
                  <select
                    id="todo-priority"
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-assignee">Assign To:</label>
                  <select
                    id="todo-assignee"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                  >
                    <option value="">-- Unassigned --</option>
                    {projectMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="todo-due-date">Due Date (optional):</label>
                  <input 
                    type="date" 
                    id="todo-due-date" 
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                  />
                </div>
                
                <button className="create-item" type="submit">Save</button>
                <button className="create-item delete" onClick={() => setDeleteItem(true)} type="submit">Delete</button>
              </form>
            </div>
          )}
          
          <div className="todo-sections">
            <div className="column">
              <h2>Todo</h2>
              <section
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "TODO")}
              >
                {todoItems_TODO.length === 0 ? (
                  <div className="empty-state">No items to do</div>
                ) : (
                  todoItems_TODO.map(item => renderTodoItem(item))
                )}
              </section>
            </div>
            
            <div className="column">
              <h2>In Progress</h2>
              <section
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
              >
                {todoItems_IN_PROGRESS.length === 0 ? (
                  <div className="empty-state">No items in progress</div>
                ) : (
                  todoItems_IN_PROGRESS.map(item => renderTodoItem(item))
                )}
              </section>
            </div>
            
            <div className="column">
              <h2>Up for Review</h2>
              <section
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "REVIEW")}
              >
                {todoItems_REVIEW.length === 0 ? (
                  <div className="empty-state">No items in review</div>
                ) : (
                  todoItems_REVIEW.map(item => renderTodoItem(item))
                )}
              </section>
            </div>
            
            <div className="column">
              <h2>Completed</h2>
              <section
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, "COMPLETED")}
              >
                {todoItems_COMPLETED.length === 0 ? (
                  <div className="empty-state">No completed items</div>
                ) : (
                  todoItems_COMPLETED.map(item => renderTodoItem(item))
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ToDoList;