import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("STUDENTS");
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [dept, setDept] = useState("");
  const [batch, setBatch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    dept: "",
    rollNo: "",
    batch: "",
  });
  const createUser = async () => {
    try {
      await api.post("/admin/create-user", form);
      alert("User created successfully (password: changeme123)");

      // reset form
      setForm({
        name: "",
        email: "",
        role: "STUDENT",
        dept: "",
        rollNo: "",
        batch: "",
      });

      // refresh admin data
      const res = await api.get("/admin/overview");
      setUsers(res.data.users);
      setTasks(res.data.tasks);
      setSubmissions(res.data.submissions);
    } catch (err) {
      alert("Failed to create user");
      console.error(err);
    }
  };

  useEffect(() => {
    api.get("/admin/overview").then((res) => {
      setUsers(res.data.users);
      setTasks(res.data.tasks);
      setSubmissions(res.data.submissions);
    });
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  const students = users.filter((u) => u.role === "STUDENT");
  const faculty = users.filter((u) => u.role === "FACULTY");

  const filteredStudents = students.filter(
    (s) => (!dept || s.dept === dept) && (!batch || s.batch === batch),
  );

  return (
    <div className="container mt-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>

        <button
          className="btn btn-success mb-3"
          onClick={() => setShowAddUser(!showAddUser)}
        >
          {showAddUser ? "Close Add User" : "Add User"}
        </button>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
        {showAddUser && (
          <div className="card p-3 mb-4">
            <h5>Add New User</h5>

            <input
              className="form-control mb-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="form-control mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <select
              className="form-control mb-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="STUDENT">STUDENT</option>
              <option value="FACULTY">FACULTY</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <input
              className="form-control mb-2"
              placeholder="Department"
              value={form.dept}
              onChange={(e) => setForm({ ...form, dept: e.target.value })}
            />

            {form.role === "STUDENT" && (
              <>
                <input
                  className="form-control mb-2"
                  placeholder="Roll Number"
                  value={form.rollNo}
                  onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                />

                <input
                  className="form-control mb-2"
                  placeholder="Batch"
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                />
              </>
            )}

            <button className="btn btn-primary" onClick={createUser}>
              Create User
            </button>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="mb-3">
        <button
          className={`btn me-2 ${view === "STUDENTS" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => {
            setView("STUDENTS");
            setSelectedFaculty(null);
          }}
        >
          Students
        </button>

        <button
          className={`btn ${view === "FACULTY" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => {
            setView("FACULTY");
            setSelectedStudent(null);
          }}
        >
          Faculty
        </button>
      </div>

      {/* ================= STUDENTS VIEW ================= */}
      {view === "STUDENTS" && (
        <>
          {/* Filters */}
          <div className="row mb-3">
            <div className="col">
              <input
                className="form-control"
                placeholder="Filter by Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              />
            </div>
            <div className="col">
              <input
                className="form-control"
                placeholder="Filter by Batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            </div>
          </div>

          {/* Student Table */}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dept</th>
                <th>Batch</th>
                <th>Roll</th>
                <th>Total Marks</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const studentSubs = submissions.filter(
                  (sub) => sub.studentId === s._id,
                );
                const totalMarks = studentSubs.reduce(
                  (sum, sub) => sum + (sub.marks || 0),
                  0,
                );

                return (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.dept}</td>
                    <td>{s.batch}</td>
                    <td>{s.rollNo}</td>
                    <td>{totalMarks}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedStudent(s)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Student Detail */}
          {selectedStudent && (
            <div className="mt-4">
              <h4>{selectedStudent.name} — Task Details</h4>

              {submissions
                .filter((sub) => sub.studentId === selectedStudent._id)
                .map((sub) => {
                  const task = tasks.find((t) => t._id === sub.taskId);
                  return (
                    <div key={sub._id} className="border p-2 mb-2">
                      <p>
                        <b>Task:</b> {task?.title}
                      </p>
                      <p>Status: {sub.status}</p>
                      <p>Marks: {sub.marks ?? "Not graded"}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* ================= FACULTY VIEW ================= */}
      {view === "FACULTY" && (
        <>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dept</th>
                <th>Tasks Given</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => {
                const facultyTasks = tasks.filter((t) => t.facultyId === f._id);
                return (
                  <tr key={f._id}>
                    <td>{f.name}</td>
                    <td>{f.dept}</td>
                    <td>{facultyTasks.length}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedFaculty(f)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Faculty Detail */}
          {selectedFaculty && (
            <div className="mt-4">
              <h4>{selectedFaculty.name} — Tasks & Students</h4>

              {tasks
                .filter((t) => t.facultyId === selectedFaculty._id)
                .map((task) => (
                  <div key={task._id} className="border p-2 mb-2">
                    <h6>{task.title}</h6>

                    {submissions
                      .filter((sub) => sub.taskId === task._id)
                      .map((sub) => {
                        const student = students.find(
                          (s) => s._id === sub.studentId,
                        );
                        return (
                          <p key={sub._id}>
                            {student?.name} — {sub.status} — {sub.marks ?? "NA"}
                          </p>
                        );
                      })}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
