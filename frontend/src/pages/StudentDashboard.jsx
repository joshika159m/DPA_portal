import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!auth?.token) return;

    axios
      .get("http://localhost:5000/api/student/tasks", {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setTasks(res.data));
  }, [auth.token]);

  return (
    <>
      <h2>Student Dashboard</h2>
      {tasks.map((t) => (
        <div key={t._id}>
          <h4>{t.title}</h4>
          <p>Deadline: {new Date(t.deadline).toDateString()}</p>
        </div>
      ))}
    </>
  );
};

export default StudentDashboard;
