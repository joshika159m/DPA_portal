import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!selectedRole) {
      alert("Please select a role first");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });

      const user = res.data;

      if (user.role !== selectedRole) {
        alert(`This account is not registered as ${selectedRole}`);
        return;
      }

      setUser(user);

      if (user.role === "ADMIN") navigate("/admin");
      if (user.role === "FACULTY") navigate("/faculty");
      if (user.role === "STUDENT") navigate("/student");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", background: "#f4f6f9" }}
    >
      <div
        className="card shadow p-4"
        style={{ width: "420px", borderRadius: "12px" }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">CampusFlow</h2>
          <p className="text-muted mb-1">Digital Academic Automation Portal</p>
          <small className="text-secondary">
            Login as <b>Admin</b>, <b>Faculty</b>, or <b>Student</b>
          </small>
        </div>

        {/* ROLE SELECTION */}
        <div className="d-flex justify-content-between mb-3">
          <button
            className={`btn w-100 me-1 ${
              selectedRole === "ADMIN" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setSelectedRole("ADMIN")}
          >
            🛡 Admin
          </button>

          <button
            className={`btn w-100 mx-1 ${
              selectedRole === "FACULTY" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setSelectedRole("FACULTY")}
          >
            👨‍🏫 Faculty
          </button>

          <button
            className={`btn w-100 ms-1 ${
              selectedRole === "STUDENT" ? "btn-warning" : "btn-outline-warning"
            }`}
            onClick={() => setSelectedRole("STUDENT")}
          >
            🎓 Student
          </button>
        </div>

        {/* EMAIL */}
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* LOGIN BUTTON */}
        <button className="btn btn-dark w-100 mb-2" onClick={handleLogin}>
          Login
        </button>

        {/* ROLE INFO */}
        {selectedRole && (
          <div className="text-center mt-2">
            <small className="text-muted">
              Logging in as <b>{selectedRole}</b>
            </small>
          </div>
        )}

        <div className="text-center mt-3">
          <small className="text-muted">
            Admin manages users • Faculty assigns tasks • Students submit work
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
