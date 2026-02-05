import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { auth } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${auth?.token}`,
  };

  /* ---------------- FETCH TASKS ---------------- */
  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/student/tasks", {
      headers,
    });
    setTasks(res.data);
  };

  /* ---------------- FETCH SUBMISSIONS ---------------- */
  const fetchSubmissions = async () => {
    const res = await axios.get("http://localhost:5000/api/submission/my", {
      headers,
    });
    setSubmissions(res.data);
  };

  useEffect(() => {
    if (!auth?.token) return;

    Promise.all([fetchTasks(), fetchSubmissions()]).finally(() =>
      setLoading(false),
    );
  }, [auth?.token]);

  /* ---------------- SUBMIT PROJECT ---------------- */
  const submitProject = async (taskId) => {
    const link = prompt("Enter GitHub / Drive link");
    if (!link) return;

    try {
      await axios.post(
        "http://localhost:5000/api/submission/submit",
        { taskId, fileUrl: link },
        { headers },
      );

      alert("Project submitted");
      fetchSubmissions();
    } catch {
      alert("Submission failed");
    }
  };

  /* ---------------- SEND DOUBT TO FACULTY ---------------- */
  const raiseDoubt = async (facultyId, taskTitle) => {
    const content = prompt(`Enter your doubt for "${taskTitle}"`);
    if (!content) return;

    try {
      await axios.post(
        "http://localhost:5000/api/messages",
        {
          receiver: facultyId,
          content,
        },
        { headers },
      );

      alert("Doubt sent to faculty");
    } catch {
      alert("Failed to send doubt");
    }
  };

  /* ---------------- CHECK IF TASK SUBMITTED ---------------- */
  const getSubmissionForTask = (taskId) =>
    submissions.find((s) => s.task._id === taskId);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h2>Student Dashboard</h2>

      {tasks.length === 0 && <p>No tasks assigned</p>}

      {tasks.map((task) => {
        const submission = getSubmissionForTask(task._id);

        return (
          <div
            key={task._id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              marginBottom: 12,
            }}
          >
            <h4>{task.title}</h4>

            <p>
              <strong>Faculty:</strong> {task.faculty?.name}
            </p>

            <p>
              <strong>Deadline:</strong>{" "}
              {new Date(task.deadline).toDateString()}
            </p>

            {!submission && (
              <button onClick={() => submitProject(task._id)}>
                Submit Project
              </button>
            )}

            {submission && (
              <>
                <p>Status: {submission.status}</p>
                <p>Marks: {submission.marks ?? "Pending"}</p>
                <p>Remarks: {submission.remarks ?? "Pending"}</p>

                <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                  View Submitted Project
                </a>
              </>
            )}

            <hr />

            <button onClick={() => raiseDoubt(task.faculty._id, task.title)}>
              Raise Doubt
            </button>
          </div>
        );
      })}
    </>
  );
};

export default StudentDashboard;
