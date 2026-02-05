import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/student/tasks", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchTasks();
  }, [auth?.token]);

  const submitProject = async (taskId) => {
    const link = prompt("Enter GitHub / Drive link");

    if (!link || link.trim() === "") {
      alert("Submission link cannot be empty");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/submission/submit",
        { taskId, fileUrl: link },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );

      alert("Project submitted successfully");
      fetchTasks(); // refresh task list
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h2>Student Dashboard</h2>

      {tasks.length === 0 && <p>No tasks assigned</p>}

      {tasks.map((t) => (
        <div
          key={t._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h4>{t.title}</h4>
          <p>{t.description}</p>
          <p>
            <strong>Deadline:</strong> {new Date(t.deadline).toDateString()}
          </p>

          <button onClick={() => submitProject(t._id)}>Submit Project</button>
        </div>
      ))}
    </>
  );
};

export default StudentDashboard;
