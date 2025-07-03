import React, { useState } from "react";
import axios from "axios";
import "../styles/Modal.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinProjectModal: React.FC<JoinProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId.trim()) {
      setError("Project ID is required");
      return;
    }

    // MongoDB ObjectId format (24 hex characters) Optional. A 24 character hexadecimal string value for the new ObjectId.
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(projectId);
    if (!isValidObjectId) {
      setError("Invalid project ID format. Please check the ID and try again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.post("http://localhost:3000/api/projects/join", {
        projectId,
        userId: user?.id,
      });

      onClose();
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      console.error("Error joining project:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to join project. Please check the ID and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Join a Project</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectId">Project ID</label>
            <input
              type="text"
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter project ID"
              disabled={loading}
            />
            <small className="form-hint">
              The project ID is a 24-character code displayed on project cards
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Joining..." : "Join Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinProjectModal;
