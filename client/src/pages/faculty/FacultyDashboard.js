import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);

  const [remarks, setRemarks] = useState({});
  const [marks, setMarks] = useState({});

  const [deptSuggestions, setDeptSuggestions] = useState([]);
  const [batchSuggestions, setBatchSuggestions] = useState([]);

  const [dept, setDept] = useState("");
  const [batch, setBatch] = useState("");

  const [rollFrom, setRollFrom] = useState("");
  const [rollTo, setRollTo] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [task, setTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const loadOverview = async () => {
    try {
      const res = await api.get("/faculty/overview");
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFilters = async () => {
    try {
      const res = await api.get("/faculty/filter-data");
      setDeptSuggestions(res.data.depts || []);
      setBatchSuggestions(res.data.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "FACULTY") {
      loadOverview();
      loadFilters();
    }
  }, [user]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!dept && !batch) {
        setStudents([]);
        return;
      }

      try {
        const res = await api.get("/faculty/students", {
          params: { dept, batch },
        });

        setStudents(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadStudents();
  }, [dept, batch]);

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const visibleStudents = students.filter((s) => {
    if (!rollFrom && !rollTo) return true;

    const roll = Number(s.rollNo);

    if (rollFrom && roll < Number(rollFrom)) return false;
    if (rollTo && roll > Number(rollTo)) return false;

    return true;
  });

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  const createTask = async () => {
    if (!task.title) return alert("Title required");
    if (!task.deadline) return alert("Deadline required");
    if (selectedStudents.length === 0) return alert("Select students");

    try {
      await api.post("/faculty/task", {
        ...task,
        selectedStudents,
      });

      alert("Task created");

      setTask({ title: "", description: "", deadline: "" });
      setSelectedStudents([]);

      loadOverview();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  const reviewSubmission = async (id) => {
    try {
      await api.put(`/faculty/review/${id}`, {
        remarks: remarks[id],
      });

      loadOverview();
    } catch (err) {
      console.error(err);
    }
  };

  const finalizeSubmission = async (id) => {
    try {
      await api.put(`/faculty/finalize/${id}`, {
        marks: marks[id],
      });

      loadOverview();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-4">
        <h3>Faculty Dashboard</h3>

        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      {/* CREATE TASK */}

      <div className="card p-3 mb-4 shadow-sm">
        <h5>Create Assignment</h5>

        <div className="row g-3">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Title"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />
          </div>

          <div className="col-md-4">
            <input
              list="deptList"
              className="form-control"
              placeholder="Department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />

            <datalist id="deptList">
              {deptSuggestions.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <div className="col-md-4">
            <input
              list="batchList"
              className="form-control"
              placeholder="Batch"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />

            <datalist id="batchList">
              {batchSuggestions.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Roll From"
              value={rollFrom}
              onChange={(e) => setRollFrom(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Roll To"
              value={rollTo}
              onChange={(e) => setRollTo(e.target.value)}
            />
          </div>

          <div className="col-md-12">
            <textarea
              className="form-control"
              placeholder="Description"
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
            />
          </div>

          <div className="col-md-4">
            <input
              type="datetime-local"
              className="form-control"
              value={task.deadline}
              onChange={(e) => setTask({ ...task, deadline: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <button className="btn btn-primary btn-sm" onClick={createTask}>
              Create Task
            </button>
          </div>
        </div>

        {(dept || batch) && (
          <div className="mt-3">
            <h6>Select Students</h6>

            <button
              className="btn btn-secondary btn-sm mb-2"
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
      </div>

      {/* SUBMISSIONS */}

      <div className="card p-3 shadow-sm">
        <h5>Student Submissions</h5>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Student</th>
                <th>Dept</th>
                <th>Batch</th>
                <th>Roll</th>
                <th>Task</th>
                <th>Status</th>
                <th>Submission</th>
                <th>Remarks</th>
                <th>Marks</th>
                <th>Actions</th>
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

                  <td>
                    <span className="badge bg-secondary">
                      {sub.reviewStatus || "SUBMITTED"}
                    </span>
                  </td>

                  <td>
                    <a href={sub.contentUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  </td>

                  <td>
                    <textarea
                      className="form-control form-control-sm"
                      value={remarks[sub._id] ?? sub.remarks ?? ""}
                      onChange={(e) =>
                        setRemarks({
                          ...remarks,
                          [sub._id]: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td style={{ width: "80px" }}>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={marks[sub._id] ?? sub.marks ?? ""}
                      onChange={(e) =>
                        setMarks({
                          ...marks,
                          [sub._id]: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => reviewSubmission(sub._id)}
                    >
                      Review
                    </button>

                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => finalizeSubmission(sub._id)}
                    >
                      Finalize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
