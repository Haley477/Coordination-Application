import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import AppRoutes from "../Routes.tsx";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Project Management",
      description:
        "Create and organize team projects in one centralized location",
      icon: "📋",
      navigateTo: "/projects",
    },
    {
      title: "To-Do Lists",
      description:
        "Track tasks and assignments for clear team responsibilities",
      icon: "✅",
      navigateTo: "/todolist",
    },
    {
      title: "Discussion Boards",
      description: "Facilitate team communication and collaboration",
      icon: "💬",
      navigateTo: "/discussion",
    },
  ];

  const getStartedClick = () => {
    navigate("/projects");
  };

  return (
    <div className="homepage-container">
      <div className="content-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Teamwork Coordinator</h1>
          <p className="welcome-subtitle">
            Simplify team collaboration with projects, tasks, and discussions
          </p>

          <div className="welcome-actions">
            <button className="get-started-btn" onClick={getStartedClick}>
              Get Started
            </button>
          </div>
        </div>

        <div className="intro-section">
          <p className="intro-text">
            Teamwork Coordinator helps you sync with your team through
            structured projects, to-do lists, and discussion boards. Keep
            everyone aligned on goals, responsibilities, and communication in
            one centralized platform.
          </p>
        </div>

        <div className="features-section">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" onClick ={() => navigate(feature.navigateTo)}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="how-it-works">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Projects</h3>
                <p>Set up new projects for your team initiatives</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Add To-Do Lists</h3>
                <p>Break down projects into manageable tasks</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Use Discussion Boards</h3>
                <p>Keep communication organized and accessible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="add-button" onClick={() => navigate("/projects")}>
        +
      </button>
    </div>
  );
};

export default HomePage;
