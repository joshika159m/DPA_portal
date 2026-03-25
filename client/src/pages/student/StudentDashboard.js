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
  const [links, setLinks] = useState({});

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

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

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");

      const unread = res.data.filter((n) => !n.isRead);
      setNotifications(unread);

      // mark read
      await api.put("/notifications/read-all");
    } catch {}
  };

  useEffect(() => {
    loadDashboard();
    loadNotifications();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    setUser(null);
    navigate("/login");
  };

  const submitLink = async (taskId) => {
    const link = links[taskId];

    if (!link) return alert("Enter submission link");

    try {
      await api.post("/student/submit", {
        taskId,
        contentUrl: link,
      });

      setLinks((prev) => ({ ...prev, [taskId]: "" }));
      setActiveTask(null);

      loadDashboard();
    } catch {
      alert("Submission failed");
    }
  };

  /* REMOVE DUPLICATE SUBMISSIONS */
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

  const completedTasks = tasks.filter((task) =>
    uniqueSubmissions.some((s) => String(s.taskId?._id) === String(task._id)),
  );

  const findSubmission = (taskId) =>
    uniqueSubmissions.find((s) => String(s.taskId?._id) === String(taskId));

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="p-3">
      {/* PROFILE */}

      <div className="card mb-4 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4>{user?.name}</h4>
            <p className="text-muted">{user?.email}</p>
          </div>

          <div>
            <span className="me-3">🔔 {notifications.length}</span>

            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </div>
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

      {/* PENDING TASKS */}

      <div className="card p-3 mb-4">
        <h5>My Tasks</h5>

        <table className="table table-hover mt-3">
          <thead>
            <tr>
              <th>Task</th>
              <th>Description</th>
              <th>Deadline</th>
              <th>Resubmit Until</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {pendingTasks.map((task) => (
              <tr key={task._id}>
                <td>{task.title}</td>

                <td>{task.description}</td>

                <td>{new Date(task.deadline).toLocaleString()}</td>

                <td>
                  {task.allowResubmission
                    ? new Date(task.resubmissionDeadline).toLocaleString()
                    : "-"}
                </td>

                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveTask(task._id)}
                  >
                    Submit
                  </button>

                  {activeTask === task._id && (
                    <div className="mt-2 d-flex gap-2">
                      <input
                        className="form-control form-control-sm"
                        placeholder="Submission link"
                        value={links[task._id] || ""}
                        onChange={(e) =>
                          setLinks({
                            ...links,
                            [task._id]: e.target.value,
                          })
                        }
                      />

                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => submitLink(task._id)}
                      >
                        Upload
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COMPLETED TASKS */}

      <div className="card p-3">
        <h5>Completed Tasks</h5>

        <table className="table table-hover mt-3">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Marks</th>
              <th>Remarks</th>
              <th>Submission</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {completedTasks.map((task) => {
              const sub = findSubmission(task._id);

              return (
                <tr key={task._id}>
                  <td>{task.title}</td>

                  <td>
                    <span
                      className={`badge ${
                        sub?.status === "ON_TIME"
                          ? "bg-success"
                          : sub?.status === "RESUBMITTED"
                            ? "bg-warning"
                            : "bg-danger"
                      }`}
                    >
                      {sub?.reviewStatus || sub?.status}
                    </span>
                  </td>

                  <td>{sub?.marks ?? "-"}</td>

                  <td>{sub?.remarks || "No feedback yet"}</td>

                  <td>
                    <a href={sub?.contentUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </td>

                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setActiveTask(task._id)}
                    >
                      Resubmit
                    </button>

                    {activeTask === task._id && (
                      <div className="mt-2 d-flex gap-2">
                        <input
                          className="form-control form-control-sm"
                          placeholder="New submission link"
                          value={links[task._id] || ""}
                          onChange={(e) =>
                            setLinks({
                              ...links,
                              [task._id]: e.target.value,
                            })
                          }
                        />

                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => submitLink(task._id)}
                        >
                          Upload
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;
