import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/SignUp"; // Import the new Signup component
import CreateProject from "./components/CreateProject";
import DiscussionBoard from "./pages/DiscussionBoard";
import ToDoList from "./pages/ToDoList";
import Projects from "./pages/Projects";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectId from "./pages/ProjectId";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} /> {/* Add explicit login route */}
      <Route path="/signup" element={<Signup />} /> {/* Add signup route */}

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-project"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/discussion"
        element={
          <ProtectedRoute>
            <DiscussionBoard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/todolist"
        element={
          <ProtectedRoute>
            <ToDoList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectId />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;