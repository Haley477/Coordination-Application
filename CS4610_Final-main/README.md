# Full Stack Application

This repository contains a full stack application with a Vite TypeScript client and an Express TypeScript server with MongoDB and Prisma ORM.

## Repository Structure

```
project-root/
├── client/           # Vite TypeScript frontend application
└── server/           # Express TypeScript backend API with MongoDB and Prisma
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

The server will start on http://localhost:3000 (or the PORT you specified in your .env file).

### 3. Client Setup

#### Install Dependencies and Start the Client

```bash
cd client
npm install
npm run dev
```

The Vite server will start on http://localhost:5173.

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

### User for testing

- email: test@example.com
- password: password123
- email: test2@example.com
- password: password123
