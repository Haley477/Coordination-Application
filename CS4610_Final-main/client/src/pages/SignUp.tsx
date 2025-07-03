import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

// Additional CSS for consistent sizing
const inputStyles = {
  boxSizing: 'border-box' as 'border-box', // Force consistent box model
  width: '100%',
  maxWidth: '240px'
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      // Use the signup function from AuthContext
      const success = await signup({
        username,
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      });

      if (success) {
        // Registration successful, redirect to login
        navigate("/login");
      } else {
        setError("Unable to create account");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2 className="login-title">Teamwork Coordinator</h2>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSignup}>
          <input
            className="login-input"
            style={inputStyles}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

          <input
            className="login-input"
            style={inputStyles}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <input
            className="login-input"
            style={inputStyles}
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />

          <input
            className="login-input"
            style={inputStyles}
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />

          <input
            className="login-input"
            style={inputStyles}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <input
            className="login-input"
            style={inputStyles}
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />

          <button 
            className="login-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <button
          className="signup-button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;