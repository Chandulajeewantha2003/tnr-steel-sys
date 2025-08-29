import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (response.data.success) {
        const { username, accessLevel } = response.data.data;
        sessionStorage.setItem("user", JSON.stringify(response.data.data));

        setTimeout(() => {
          if (username === "Chandula" || accessLevel === "Executive") {
            navigate("/home-gm");
          } else {
            switch (accessLevel) {
              case "Employee Management":
                navigate("/hrdashboard");
                break;
              case "Production Management":
                navigate("/pmdashboard");
                break;
              case "Sales Management":
                navigate("/salesdashboard");
                break;
              case "Stock Management":
                navigate("/mainhome");
                break;
              default:
                setError("Unknown access level.");
            }
          }
          setIsLoading(false);
        }, 1000);
      } else {
        setError(response.data.message || "Login failed.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.response?.data?.message || "Error during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate">
        <h2 className="login-title">Welcome Back</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
            <label>Username</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <label>Password</label>
          </div>

          <div className="forgot-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className={`login-btn ${isLoading ? "loading" : ""}`} disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
