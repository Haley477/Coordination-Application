# Full Stack Project Management Application

This repository contains a full stack application with a Vite TypeScript client and an Express TypeScript server with MongoDB and Prisma ORM for project management and team collaboration.

## Repository Structure

```
project-root/
├── client/                   # Vite TypeScript frontend application
└── server/                   # Express TypeScript backend API
    ├── src/
    │   ├── config/           # Configuration files
    │   │   └── db.ts         # Database configuration
    │   ├── controllers/      # Controllers for business logic (MVC)
    │   │   ├── projectController.ts
    │   │   └── userController.ts
    │   ├── routes/           # API route definitions
    │   │   ├── discussionRoutes.ts
    │   │   ├── projectRoutes.ts
    │   │   ├── todoRoutes.ts
    │   │   └── userRoutes.ts
    │   └── index.ts          # Main application entry point
    ├── prisma/               # Prisma ORM schema and migrations
    │   └── schema.prisma     # Database schema definition
    ├── package.json          # Server dependencies
    └── tsconfig.json         # TypeScript configuration
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Server Setup

#### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
PORT=3000
```

Replace the placeholders in the MongoDB connection string with your actual MongoDB credentials.

#### Install Dependencies and Start the Server

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

The server will start on http://localhost:3000

### 3. Client Setup

#### Install Dependencies and Start the Client

```bash
cd client
npm install
npm run dev
```

The Vite server will start on http://localhost:5173.

## Project Architecture

### MVC Architecture (In Progress)

The server follows an MVC (Model-View-Controller) pattern, but it's currently in the process of being fully implemented:

- **Models**: Handled by Prisma ORM with MongoDB
- **Views**: Handled by the client application (Vite/React)
- **Controllers**: Business logic for each resource type

#### Current Status:

- ✅ `ProjectController`: Fully implemented using the MVC pattern
- ⚠️ `DiscussionController` and `TodoController`: Logic currently exists within route files and needs to be refactored

#### Implementation Example:

**Controller (projectController.ts):**

```typescript
// Separate business logic in controller
export const projectController = {
  getAllProjects: async (req: Request, res: Response) => {
    // Logic to get all projects
  },
  // Other controller methods...
};
```

**Route (projectRoutes.ts):**

```typescript
// Clean route definitions
import { projectController } from "../controllers/projectController";
const router = express.Router();
router.get("/", projectController.getAllProjects);
// Other routes...
export default router;
```

#### Refactoring TODO:

- Move logic from `discussionRoutes.ts` to a new `discussionController.ts`
- Move logic from `todoRoutes.ts` to a new `todoController.ts`

## Available Scripts

### Server

- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript project
- `npm start`: Run the built project
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:push`: Update the database schema

### Client

- `npm run dev`: Start the Vite development server
- `npm run build`: Build the production version
- `npm run preview`: Preview the built application locally

## API Documentation

The API provides the following endpoints:

- `/api/projects` - Project management
- `/api/users` - User management
- `/api/todos` - Task management
- `/api/discussions` - Team discussions

## Database Schema

The application uses MongoDB with Prisma ORM. The main data models include:

### Project Management

- **Project**: Core entity with name, description, and active status
- **ProjectMembership**: Many-to-many relationship between Users and Projects with roles

### Task Management

- **ToDoList**: Lists of tasks belonging to a project
- **ToDoItem**: Individual tasks with status, priority, and assignments

### Discussion System

- **DiscussionBoard**: Forums for project-related discussions
- **DiscussionPost**: Individual messages in discussion boards

### User System

- **User**: Application users with authentication details and profile info
- **Role Enum**: USER, ADMIN, OWNER
- **Status Enum**: TODO, IN_PROGRESS, REVIEW, COMPLETED
- **Priority Enum**: LOW, MEDIUM, HIGH
