import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */

  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);

  const [deptSuggestions, setDeptSuggestions] = useState([]);
  const [batchSuggestions, setBatchSuggestions] = useState([]);

  const [dept, setDept] = useState("");
  const [batch, setBatch] = useState("");

  const [rollFrom, setRollFrom] = useState("");
  const [rollTo, setRollTo] = useState("");

  const [search, setSearch] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [remarks, setRemarks] = useState({});
  const [marks, setMarks] = useState({});

  const [showToast, setShowToast] = useState(false);

  const [task, setTask] = useState({
    title: "",
    description: "",
    date: "",
  });

  /* ---------------- LOAD DATA ---------------- */

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
    const t = setInterval(loadOverview, 5000);
    return () => clearInterval(t);
  }, []);

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

  /* ---------------- FILTER STUDENTS ---------------- */

  const visibleStudents = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      const roll = Number(s.rollNo);
      if (rollFrom && roll < Number(rollFrom)) return false;
      if (rollTo && roll > Number(rollTo)) return false;
      return true;
    });

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedStudents(visibleStudents.map((s) => s._id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  /* ---------------- CREATE TASK ---------------- */

  const createTask = async () => {
    if (!task.title) return alert("Title required");
    if (!task.date) return alert("Deadline required");
    if (selectedStudents.length === 0) return alert("Select students");

    const deadline = `${task.date}`;

    try {
      await api.post("/faculty/task", {
        title: task.title,
        description: task.description,
        deadline,
        selectedStudents,
      });

      setTask({
        title: "",
        description: "",
        date: "",
      });

      setSelectedStudents([]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      loadOverview();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- REVIEW ---------------- */

  const reviewSubmission = async (id) => {
    await api.put(`/faculty/review/${id}`, {
      remarks: remarks[id],
    });
    loadOverview();
  };

  const finalizeSubmission = async (id) => {
    await api.put(`/faculty/finalize/${id}`, {
      marks: marks[id],
    });
    loadOverview();
  };

  /* ---------------- GROUP SUBMISSIONS ---------------- */

  const grouped = submissions.reduce((acc, sub) => {
    const year = sub.studentId?.batch;
    const dept = sub.studentId?.dept;
    const student = sub.studentId?._id;

    if (!acc[year]) acc[year] = {};
    if (!acc[year][dept]) acc[year][dept] = {};
    if (!acc[year][dept][student]) {
      acc[year][dept][student] = {
        name: sub.studentId?.name,
        tasks: [],
      };
    }

    acc[year][dept][student].tasks.push(sub);
    return acc;
  }, {});

  /* ---------------- DEADLINE BADGE ---------------- */

  const deadlineBadge = (deadline) => {
    if (!deadline) return null;

    const now = new Date();
    const d = new Date(deadline);

    return (
      <span className={`badge ${d < now ? "bg-danger" : "bg-success"}`}>
        {d < now ? "Overdue" : "Active"}
      </span>
    );
  };

  /* ---------------- LOGOUT ---------------- */

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="container py-4" style={{ maxWidth: "1100px" }}>
      <div className="d-flex justify-content-between mb-4">
        <h4 className="fw-semibold">Faculty Dashboard</h4>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      {/* CREATE TASK */}

      <div className="card p-4 mb-4 shadow-sm border-0">
        <h5 className="mb-3">Create Assignment</h5>

        <div className="row g-2 mb-2">
          <div className="col-md-3">
            <input
              list="deptList"
              className="form-control form-control-sm"
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

          <div className="col-md-3">
            <input
              list="batchList"
              className="form-control form-control-sm"
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

          <div className="col-md-3">
            <input
              className="form-control form-control-sm"
              placeholder="Roll From"
              value={rollFrom}
              onChange={(e) => setRollFrom(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <input
              className="form-control form-control-sm"
              placeholder="Roll To"
              value={rollTo}
              onChange={(e) => setRollTo(e.target.value)}
            />
          </div>
        </div>

        <input
          className="form-control form-control-sm mb-2"
          placeholder="Search student"
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="d-flex gap-2 mb-2">
          <button className="btn btn-sm btn-dark" onClick={selectAll}>
            Select All
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={clearSelection}
          >
            Clear
          </button>
        </div>

        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            border: "1px solid #eee",
            padding: "8px",
          }}
        >
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

        <hr />

        <input
          className="form-control form-control-sm mb-2"
          placeholder="Title"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
        />

        <textarea
          className="form-control form-control-sm mb-2"
          placeholder="Description"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />

        <div className="d-flex gap-2">
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ maxWidth: "150px" }}
            value={task.date}
            onChange={(e) => setTask({ ...task, date: e.target.value })}
          />

          <button className="btn btn-primary btn-sm" onClick={createTask}>
            Create
          </button>
        </div>
      </div>

      {/* SUBMISSIONS */}

      {Object.entries(grouped).map(([year, deptObj]) => (
        <div key={year} className="card p-3 mb-4 shadow-sm border-0">
          <h5 className="text-primary border-bottom pb-1 mb-3">
            🎓 Batch {year}
          </h5>

          {Object.entries(deptObj).map(([dept, studentObj]) => (
            <div key={dept}>
              <h6 className="text-secondary mt-3 mb-2">📚 {dept}</h6>

              {Object.values(studentObj).map((student) => (
                <div key={student.name} className="mb-3">
                  <div className="fw-bold text-dark mb-2">
                    👤 {student.name}
                  </div>

                  {student.tasks.map((sub) => (
                    <div
                      key={sub._id}
                      className="border rounded p-2 mb-2 bg-white"
                    >
                      <div className="row align-items-center g-2">
                        <div className="col-md-3">
                          <div className="fw-semibold">{sub.taskId?.title}</div>
                          <small className="text-muted">
                            {deadlineBadge(sub.taskId?.deadline)}
                          </small>
                        </div>

                        <div className="col-md-4">
                          <textarea
                            className="form-control form-control-sm"
                            placeholder="Remarks"
                            rows={1}
                            value={remarks[sub._id] ?? ""}
                            onChange={(e) =>
                              setRemarks({
                                ...remarks,
                                [sub._id]: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Marks"
                            value={marks[sub._id] ?? ""}
                            onChange={(e) =>
                              setMarks({
                                ...marks,
                                [sub._id]: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-3 text-end">
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => reviewSubmission(sub._id)}
                          >
                            Review
                          </button>

                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => finalizeSubmission(sub._id)}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {showToast && (
        <div style={{ position: "fixed", top: 20, right: 20 }}>
          <div className="toast show text-bg-success">
            <div className="toast-body">Task created successfully 🎉</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
