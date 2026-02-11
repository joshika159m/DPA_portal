import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      // Save user in context
      setUser(res.data);

      // Redirect based on role
      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else if (res.data.role === "FACULTY") {
        navigate("/faculty");
      } else if (res.data.role === "STUDENT") {
        navigate("/student");
      } else {
        alert("Unknown role");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3>CampusFlow Login</h3>

      <input
        className="form-control mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="form-control mb-2"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary w-100" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
