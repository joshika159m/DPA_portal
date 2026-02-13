import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [deptSuggestions, setDeptSuggestions] = useState([]);
  const [batchSuggestions, setBatchSuggestions] = useState([]);

  const [dept, setDept] = useState("");
  const [batch, setBatch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [task, setTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  /* LOAD OVERVIEW */
  const loadOverview = async () => {
    const res = await api.get("/faculty/overview");
    setSubmissions(res.data.submissions || []);
  };

  /* LOAD FILTER DATA */
  const loadFilters = async () => {
    const res = await api.get("/faculty/filter-data");
    setDeptSuggestions(res.data.depts);
    setBatchSuggestions(res.data.batches);
  };

  useEffect(() => {
    if (user?.role === "FACULTY") {
      loadOverview();
      loadFilters();
    }
  }, [user]);

  /* LOAD STUDENTS WHEN FILTER CHANGES */
  useEffect(() => {
    const loadStudents = async () => {
      if (!dept && !batch) {
        setStudents([]);
        return;
      }

      const res = await api.get("/faculty/students", {
        params: { dept, batch },
      });

      setStudents(res.data);
    };

    loadStudents();
  }, [dept, batch]);

  /* TOGGLE STUDENT */
  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* SAVE MARKS */
  const saveMarks = async (submissionId, marks) => {
    await api.put(`/faculty/grade/${submissionId}`, { marks });
    loadOverview();
  };

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
    if (selectedStudents.length === 0) return alert("Select students");

    await api.post("/faculty/task", {
      ...task,
      studentIds: selectedStudents,
    });

    alert("Task created");

    setTask({ title: "", description: "", deadline: "" });
    setSelectedStudents([]);
  };

  const [rollFrom, setRollFrom] = useState("");
  const [rollTo, setRollTo] = useState("");

  const visibleStudents = students.filter((s) => {
    if (!rollFrom && !rollTo) return true;

    const roll = Number(s.rollNo);

    if (rollFrom && roll < Number(rollFrom)) return false;
    if (rollTo && roll > Number(rollTo)) return false;

    return true;
  });

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

      {/* DEPT SUGGESTION */}
      <input
        list="deptList"
        className="form-control mb-2"
        placeholder="Department"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      />
      <datalist id="deptList">
        {deptSuggestions.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>

      {/* BATCH SUGGESTION */}
      <input
        list="batchList"
        className="form-control mb-2"
        placeholder="Batch"
        value={batch}
        onChange={(e) => setBatch(e.target.value)}
      />
      <datalist id="batchList">
        {batchSuggestions.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      <div className="row mb-2">
        <div className="col">
          <input
            className="form-control"
            placeholder="Roll From"
            value={rollFrom}
            onChange={(e) => setRollFrom(e.target.value)}
          />
        </div>

        <div className="col">
          <input
            className="form-control"
            placeholder="Roll To"
            value={rollTo}
            onChange={(e) => setRollTo(e.target.value)}
          />
        </div>
      </div>

      {/* STUDENT CHECKBOX LIST */}
      {(dept || batch) && (
        <div className="card p-3 mb-3">
          <h5>Select Students</h5>
          <button
            className="btn btn-secondary mb-2"
            onClick={() =>
              setSelectedStudents(visibleStudents.map((s) => s._id))
            }
          >
            Select Visible
          </button>

          {visibleStudents.map((s) => (
            <div key={s._id}>
              <input
                type="checkbox"
                checked={selectedStudents.includes(s._id)}
                onChange={() => toggleStudent(s._id)}
              />{" "}
              {s.name} ({s.rollNo})
            </div>
          ))}
        </div>
      )}

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
          {submissions.map((sub) => (
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
