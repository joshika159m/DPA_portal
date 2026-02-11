import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/student/tasks");
      setTasks(res.data.tasks || []);
      setSubmissions(res.data.submissions || []);
    } catch {
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    navigate("/login");
  };

  const submitLink = async (taskId) => {
    if (!link) return alert("Enter submission link");

    await api.post("/student/submit", {
      taskId,
      contentUrl: link,
    });

    setLink("");
    setActiveTask(null);
    loadDashboard();
  };

  /* REMOVE DUPLICATES */
  const uniqueSubmissions = Object.values(
    submissions.reduce((acc, sub) => {
      const id = sub.taskId?._id || sub.taskId;
      acc[id] = sub;
      return acc;
    }, {}),
  );

  const pendingTasks = tasks.filter(
    (task) =>
      !uniqueSubmissions.some(
        (s) => String(s.taskId?._id) === String(task._id),
      ),
  );

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="p-3">
      {/* PROFILE CARD */}
      <div className="card mb-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4>{user?.name}</h4>
            <p className="text-muted">{user?.email}</p>
          </div>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>

        <hr />

        <div className="row text-center">
          <div className="col-md-4">
            <p className="mb-0 text-muted">Roll Number</p>
            <b>{user?.rollNo || "—"}</b>
          </div>
          <div className="col-md-4">
            <p className="mb-0 text-muted">Department</p>
            <b>{user?.dept || "—"}</b>
          </div>
          <div className="col-md-4">
            <p className="mb-0 text-muted">Batch</p>
            <b>{user?.batch || "—"}</b>
          </div>
        </div>
      </div>

      {/* MY TASKS */}
      <h4>My Tasks</h4>

      {pendingTasks.length === 0 && (
        <p className="text-muted">No pending tasks</p>
      )}

      {pendingTasks.map((task) => (
        <div key={task._id} className="card mb-3 p-3">
          <h5>{task.title}</h5>
          <p>{task.description}</p>

          <button
            className="btn btn-primary"
            onClick={() => setActiveTask(task._id)}
          >
            Submit
          </button>

          {activeTask === task._id && (
            <>
              <input
                className="form-control mt-2"
                placeholder="Submission link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />

              <button
                className="btn btn-success mt-2"
                onClick={() => submitLink(task._id)}
              >
                Submit Link
              </button>
            </>
          )}
        </div>
      ))}

      {/* COMPLETED */}
      <h4 className="mt-4">Completed Tasks</h4>

      {uniqueSubmissions.length === 0 && (
        <p className="text-muted">No submissions yet</p>
      )}

      {uniqueSubmissions.map((sub) => (
        <div key={sub._id} className="card mb-2 p-2">
          <b>{sub.taskId?.title}</b>

          <p>
            Submission:{" "}
            <a href={sub.contentUrl} target="_blank" rel="noreferrer">
              View
            </a>
          </p>

          <p>Status: {sub.status}</p>
          <p>Marks: {sub.marks ?? "NIL"}</p>

          <button
            className="btn btn-warning btn-sm"
            onClick={() => setActiveTask(sub.taskId._id)}
          >
            Resubmit
          </button>

          {activeTask === sub.taskId._id && (
            <>
              <input
                className="form-control mt-2"
                placeholder="New submission link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />

              <button
                className="btn btn-success mt-2"
                onClick={() => submitLink(sub.taskId._id)}
              >
                Submit Again
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentDashboard;
