import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const FacultyDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!auth?.token) return;

    axios
      .get("http://localhost:5000/api/faculty/students", {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setStudents(res.data));
  }, [auth.token]);

  const createTask = async () => {
    await axios.post(
      "http://localhost:5000/api/faculty/task",
      {
        title,
        deadline,
        students: selected,
      },
      { headers: { Authorization: `Bearer ${auth.token}` } },
    );
    alert("Task created");
  };

  return (
    <>
      <h2>Faculty Dashboard</h2>
      <input
        placeholder="Task title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="date" onChange={(e) => setDeadline(e.target.value)} />

      {students.map((s) => (
        <div key={s._id}>
          <input
            type="checkbox"
            onChange={(e) =>
              e.target.checked
                ? setSelected([...selected, s._id])
                : setSelected(selected.filter((id) => id !== s._id))
            }
          />
          {s.name}
        </div>
      ))}

      <button onClick={createTask}>Create Task</button>
    </>
  );
};

export default FacultyDashboard;
