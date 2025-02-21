import React, { useState } from "react";
import "../styles/Login.scss";
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Import icons for eye toggle

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For error message
  const [loading, setLoading] = useState(false); // For loading state
  const [passwordVisible, setPasswordVisible] = useState(false); // For toggling password visibility

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Show loading state

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loggedIn = await response.json();

      if (response.ok && loggedIn) {
        dispatch(
          setLogin({
            user: loggedIn.user,
            token: loggedIn.token,
          })
        );

        if (loggedIn.user.role === "admin") {
          navigate("/admin"); // Navigate to the admin panel
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid email or password"); // Show error message to the user
      }
    } catch (err) {
      console.log("Login failed", err.message);
      setError("Something went wrong. Please try again."); // Show error message
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        <form className="login_content_form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username" // Improved accessibility
          />
          <div className="password-input-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password" // Improved accessibility
            />
            <span
              className="toggle-password-icon"
              onClick={togglePasswordVisibility}
              title={passwordVisible ? "Hide Password" : "Show Password"}
            >
              {passwordVisible ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>
        {error && <p className="error">{error}</p>} {/* Show error message */}
        <a href="/register">Don't have an account? Sign In Here</a>
      </div>
    </div>
  );
};

export default LoginPage;
