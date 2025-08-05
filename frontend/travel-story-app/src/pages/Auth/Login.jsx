import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { validateEmail } from "../../utils/helper"; // burayı güncelledim
import axiosInstance from "../../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        window.location.href = "/dashboard"; // Tam sayfa yenile, anlık problemi çözer
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        toast.success("An unexpected error occurred. Please try again.");
        //  setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-left-content"></div>
        </div>

        <div className="login-right">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && <div className="error-message">{error}</div>}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button type="submit" className="primary">
              LOGIN
            </button>

            <p className="or-text">Or</p>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate("/signUp")}
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
