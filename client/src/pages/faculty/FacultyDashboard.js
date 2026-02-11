import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [dept, setDept] = useState("");
  const [batch, setBatch] = useState("");

  const [task, setTask] = useState({
    title: "",
    description: "",
    targetDept: "",
    targetBatch: "",
    from: "",
    to: "",
    deadline: "",
  });

  /* LOAD SUBMISSIONS */
  const loadOverview = async () => {
    try {
      const res = await api.get("/faculty/overview");
      setSubmissions(res.data.submissions || []);
    } catch {
      console.log("Overview load failed");
    }
  };

  useEffect(() => {
    if (user?.role === "FACULTY") loadOverview();
  }, [user]);

  /* AUTO REFRESH */
  useEffect(() => {
    const interval = setInterval(loadOverview, 5000);
    return () => clearInterval(interval);
  }, []);

  /* SAVE MARKS */
  const saveMarks = async (submissionId, marks) => {
    try {
      await api.put(`/faculty/grade/${submissionId}`, { marks });
      alert("Marks saved");
      loadOverview();
    } catch {
      alert("Failed to save marks");
    }
  };

  /* UPDATE MARKS INPUT */
  const handleMarksChange = (id, value) => {
    setSubmissions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, marks: value } : s)),
    );
  };

  /* LOGOUT */
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  /* CREATE TASK */
  const createTask = async () => {
    if (!task.deadline) return alert("Deadline required");

    try {
      await api.post("/faculty/task", {
        title: task.title,
        description: task.description,
        targetDept: task.targetDept ? [task.targetDept] : [],
        targetBatch: task.targetBatch ? [task.targetBatch] : [],
        targetRollRange:
          task.from && task.to ? { from: task.from, to: task.to } : null,
        deadline: task.deadline,
      });

      alert("Task created");

      setTask({
        title: "",
        description: "",
        targetDept: "",
        targetBatch: "",
        from: "",
        to: "",
        deadline: "",
      });

      loadOverview();
    } catch {
      alert("Failed to create task");
    }
  };

  /* FILTER */
  const filteredRows = submissions.filter(
    (sub) =>
      (!dept || sub.studentId?.dept === dept) &&
      (!batch || sub.studentId?.batch === batch),
  );

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between mb-4">
        <h2>Faculty Dashboard</h2>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {/* CREATE TASK */}
      <h4>Create Assignment</h4>

      <input
        className="form-control mb-2"
        placeholder="Title"
        value={task.title}
        onChange={(e) => setTask({ ...task, title: e.target.value })}
      />

      <textarea
        className="form-control mb-2"
        placeholder="Description"
        value={task.description}
        onChange={(e) => setTask({ ...task, description: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="Department"
        value={task.targetDept}
        onChange={(e) => setTask({ ...task, targetDept: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="Batch"
        value={task.targetBatch}
        onChange={(e) => setTask({ ...task, targetBatch: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="Roll From"
        value={task.from}
        onChange={(e) => setTask({ ...task, from: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="Roll To"
        value={task.to}
        onChange={(e) => setTask({ ...task, to: e.target.value })}
      />

      <input
        type="datetime-local"
        className="form-control mb-2"
        value={task.deadline}
        onChange={(e) => setTask({ ...task, deadline: e.target.value })}
      />

      <button className="btn btn-primary mb-4" onClick={createTask}>
        Create Task
      </button>

      {/* SUBMISSIONS */}
      <h4 className="mt-5">Student Submissions</h4>

      <div className="row mb-3">
        <div className="col">
          <input
            className="form-control"
            placeholder="Filter by Dept"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            className="form-control"
            placeholder="Filter by Batch"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          />
        </div>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Student</th>
            <th>Dept</th>
            <th>Batch</th>
            <th>Roll</th>
            <th>Task</th>
            <th>Status</th>
            <th>Submission</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((sub) => (
            <tr key={sub._id}>
              <td>{sub.studentId?.name}</td>
              <td>{sub.studentId?.dept}</td>
              <td>{sub.studentId?.batch}</td>
              <td>{sub.studentId?.rollNo}</td>
              <td>{sub.taskId?.title}</td>
              <td>{sub.status}</td>

              <td>
                <a href={sub.contentUrl} target="_blank" rel="noreferrer">
                  View
                </a>
              </td>

              <td>
                <input
                  type="number"
                  className="form-control"
                  value={sub.marks || ""}
                  onChange={(e) => handleMarksChange(sub._id, e.target.value)}
                />

                <button
                  className="btn btn-success mt-1"
                  onClick={() => saveMarks(sub._id, sub.marks)}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyDashboard;
