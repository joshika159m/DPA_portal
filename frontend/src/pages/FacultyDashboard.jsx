import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const FacultyDashboard = () => {
  const { auth } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const headers = {
    Authorization: `Bearer ${auth?.token}`,
  };

  /* ---------------- FETCH STUDENTS ---------------- */
  useEffect(() => {
    if (!auth?.token) return;

    axios
      .get("http://localhost:5000/api/faculty/students", { headers })
      .then((res) => setStudents(res.data))
      .catch(() => alert("Failed to load students"));
  }, [auth]);

  /* ---------------- FETCH TASKS ---------------- */
  const loadTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/faculty/tasks", {
      headers,
    });
    setTasks(res.data);
  };

  useEffect(() => {
    if (!auth?.token) return;
    loadTasks();
  }, [auth]);

  /* ---------------- CREATE TASK ---------------- */
  const createTask = async () => {
    if (!title || !deadline || selectedStudents.length === 0) {
      alert("Fill all fields and select students");
      return;
    }

    await axios.post(
      "http://localhost:5000/api/faculty/task",
      {
        title,
        deadline,
        students: selectedStudents,
      },
      { headers },
    );

    alert("Task created");

    setTitle("");
    setDeadline("");
    setSelectedStudents([]);

    loadTasks();
  };

  /* ---------------- VIEW SUBMISSIONS ---------------- */
  const viewSubmissions = async (taskId) => {
    const res = await axios.get(
      `http://localhost:5000/api/submission/task/${taskId}`,
      { headers },
    );
    setActiveTaskId(taskId);
    setSubmissions(res.data);
  };

  /* ---------------- REVIEW SUBMISSION (STEP 5) ---------------- */
  const reviewSubmission = async (submissionId) => {
    const marks = prompt("Enter marks");
    if (marks === null) return;

    const remarks = prompt("Enter remarks");
    if (remarks === null) return;

    await axios.put(
      `http://localhost:5000/api/submission/review/${submissionId}`,
      { marks, remarks },
      { headers },
    );

    alert("Submission reviewed");

    // reload submissions
    viewSubmissions(activeTaskId);
  };

  return (
    <>
      <h2>Faculty Dashboard</h2>

      {/* ---------- CREATE TASK ---------- */}
      <h3>Create Task</h3>

      <input
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <h4>Select Students</h4>
      {students.map((s) => (
        <div key={s._id}>
          <input
            type="checkbox"
            checked={selectedStudents.includes(s._id)}
            onChange={(e) =>
              e.target.checked
                ? setSelectedStudents([...selectedStudents, s._id])
                : setSelectedStudents(
                    selectedStudents.filter((id) => id !== s._id),
                  )
            }
          />
          {s.name}
        </div>
      ))}

      <button onClick={createTask}>Create Task</button>

      <hr />

      {/* ---------- TASK LIST ---------- */}
      <h3>My Tasks</h3>

      {tasks.length === 0 && <p>No tasks created yet</p>}

      {tasks.map((task) => (
        <div key={task._id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <h4>{task.title}</h4>
          <p>Deadline: {new Date(task.deadline).toDateString()}</p>
          <button onClick={() => viewSubmissions(task._id)}>
            View Submissions
          </button>
        </div>
      ))}

      <hr />

      {/* ---------- SUBMISSIONS + REVIEW ---------- */}
      {activeTaskId && (
        <>
          <h3>Submissions</h3>

          {submissions.length === 0 && <p>No submissions yet</p>}

          {submissions.map((sub) => (
            <div
              key={sub._id}
              style={{
                border: "1px solid #aaa",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <strong>{sub.student.name}</strong> <br />
              Status: {sub.status} <br />
              Marks: {sub.marks ?? "Not graded"} <br />
              Remarks: {sub.remarks ?? "Not reviewed"} <br />
              <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                View Project
              </a>
              <br />
              {sub.status !== "reviewed" && (
                <button onClick={() => reviewSubmission(sub._id)}>
                  Review Submission
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default FacultyDashboard;
