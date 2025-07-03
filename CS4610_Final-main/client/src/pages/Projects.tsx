import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/Projects.css";
import JoinProjectModal from "../components/JoinProjectModal";

interface Project {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const username = user?.username || "user";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        if (!user?.id) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/api/projects/user/${user.id}`
        );
        setProjects(response.data);
        console.log("Fetched projects:", response.data);
        console.log("User ID:", user.id);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleCreateProject = () => {
    navigate("/create-project");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const openJoinModal = () => {
    setIsJoinModalOpen(true);
  };

  const closeJoinModal = () => {
    setIsJoinModalOpen(false);
  };

  return (
    <div className="app-container">
      <div className="content-container">
        <h2 className="welcome-message">Hello, {username}</h2>

        <div className="projects-section">
          <div className="section-header">
            <h3 className="section-title">My projects:</h3>
            <div className="header-buttons">
              <button className="join-project-btn" onClick={openJoinModal}>
                Join Project
              </button>
              <button
                className="create-project-btn"
                onClick={handleCreateProject}
              >
                Create Project
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p className="loading">Loading projects...</p>
          ) : projects.length > 0 ? (
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <h4 className="project-title">{project.name}</h4>
                  <p className="project-id">ID: {project.id}</p>
                  <button
                    className="copy-id-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(project.id);
                    }}
                    title="Copy ID to clipboard"
                  >
                    Copy
                  </button>
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-projects-message">
              No projects found. Click the "Create Project" button to get
              started.
            </p>
          )}
        </div>
      </div>

      <button
        className="add-button"
        onClick={() => navigate("/create-project")}
      >
        +
      </button>
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={closeJoinModal} />
    </div>
  );
};

export default Projects;
