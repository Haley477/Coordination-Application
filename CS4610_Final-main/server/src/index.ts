import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";
import projectRoutes from "./routes/projectRoutes";
import userRoutes from "./routes/userRoutes";
import todoRoutes from "./routes/todoRoutes";
import discussionRoutes from "./routes/discussionRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// Create Prisma client
export const prisma = new PrismaClient();

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a discussion board room
  socket.on("join-board", (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  // Leave a discussion board room
  socket.on("leave-board", (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.id} left board ${boardId}`);
  });

  // Handle new chat messages
  socket.on("chat-message", async ({boardId, userId, content, fileName, fileData}) => {

    try {
      // Save message to database
      const post = await prisma.discussionPost.create({
        data: {
          boardId,
          userId,
          content,
          fileName, 
          fileData,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      
      // Add fileUrl if fileData exists
    const fileUrl = fileData
    ? `${fileData}`
    : undefined;

      // Broadcast to everyone in the room
      io.to(`board-${boardId}`).emit("chat-message", {
        ...post, 
        fileUrl,
    });
    } catch (error) {
      console.error("Error saving chat message:", error);
      socket.emit("error", { message: "Failed to save message" });
    }
  });

  // Handle typing indicators, let everyone in the room know who is typing
  socket.on("typing", (data) => {
    const { boardId, userId, username, isTyping } = data;

    socket
      .to(`board-${boardId}`)
      .emit("typing", { userId, username, isTyping });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io };

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/discussions", discussionRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Discussion",
    version: "1.0.0",
    endpoints: [
      "/api/projects",
      "/api/users",
      "/api/todos",
      "/api/discussions",
    ],
  });
});

// Server Start
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
