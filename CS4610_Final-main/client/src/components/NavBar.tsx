import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/NavBar.css";

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // NOT shown on login page
  if (location.pathname === "/") {
    return null;
  }

  // Only show if authenticated
  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path ? "tab active" : "tab";
  };

  return (
    <header>
      <div className="coordinator-header">
        <h3>Teamwork Coordinator</h3>
        <div className="header-right">
          <div className="user-controls">
            {user && (
              <span className="welcome-text">
                Welcome, {user.username || user.email}
              </span>
            )}
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
          <div className="profile-circle"></div>
        </div>
      </div>

      <div className="tab-container">
        <div className={isActive("/home")} onClick={() => navigate("/home")}>
          Home
        </div>
        <div
          className={isActive("/projects")}
          onClick={() => navigate("/projects")}
        >
          Projects
        </div>
        <div
          className={isActive("/todolist")}
          onClick={() => navigate("/todolist")}
        >
          To-do Lists
        </div>
        <div
          className={isActive("/discussion")}
          onClick={() => navigate("/discussion")}
        >
          Discussion Boards
        </div>
      </div>
    </header>
  );
};

export default NavBar;
