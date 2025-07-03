import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateProject.css";
import { useAuth } from "../context/AuthContext";
interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Project | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("http://localhost:3000/api/projects", {
        name,
        description,
        isActive: true,
        userId: user?.id,
      });

      setSuccess(response.data);

      // Clear form
      setName("");
      setDescription("");

      // Redirect after success
      setTimeout(() => {
        navigate("/projects");
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Axios error
        const errorMessage =
          err.response?.data?.error || "Failed to create project";
        setError(errorMessage);
        console.error("API Error:", err.response?.data);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <div className="app-container">
      <div className="content-container">
        <div className="create-project-container">
          <div className="create-project-header">
            <h2>Add new project</h2>
          </div>

          <form className="create-project-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description (optional)"
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="success-message">
              <h3>Project Created Successfully!</h3>
              <p>Redirecting to projects list...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
