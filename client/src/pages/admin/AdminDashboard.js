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

  const loadAdminData = async () => {
    const res = await api.get("/admin/overview");
    setUsers(res.data.users);
    setTasks(res.data.tasks);
    setSubmissions(res.data.submissions);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  const createUser = async () => {
    try {
      await api.post("/admin/create-user", form);

      alert("User created. Password: changeme123");

      setForm({
        name: "",
        email: "",
        role: "STUDENT",
        dept: "",
        rollNo: "",
        batch: "",
      });

      setShowAddUser(false);
      loadAdminData();
    } catch {
      alert("Failed to create user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await api.delete(`/admin/user/${id}`);
    loadAdminData();
  };

  const students = users.filter((u) => u.role === "STUDENT");
  const faculty = users.filter((u) => u.role === "FACULTY");

  const filteredStudents = students.filter(
    (s) => (!dept || s.dept === dept) && (!batch || s.batch === batch),
  );

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>

        <div>
          <button
            className="btn btn-success me-2"
            onClick={() => setShowAddUser(!showAddUser)}
          >
            Add User
          </button>

          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ADD USER CARD */}
      {showAddUser && (
        <div className="card p-3 mb-4">
          <h5 className="mb-3">Create User</h5>

          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="col-md-2">
              <input
                className="form-control"
                placeholder="Department"
                value={form.dept}
                onChange={(e) => setForm({ ...form, dept: e.target.value })}
              />
            </div>

            {form.role === "STUDENT" && (
              <>
                <div className="col-md-1">
                  <input
                    className="form-control"
                    placeholder="Roll"
                    value={form.rollNo}
                    onChange={(e) =>
                      setForm({ ...form, rollNo: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-1">
                  <input
                    className="form-control"
                    placeholder="Batch"
                    value={form.batch}
                    onChange={(e) =>
                      setForm({ ...form, batch: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div className="col-md-12 mt-2">
              <button className="btn btn-primary" onClick={createUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SWITCH */}
      <div className="mb-3">
        <button
          className={`btn me-2 ${
            view === "STUDENTS" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => {
            setView("STUDENTS");
            setSelectedFaculty(null);
          }}
        >
          Students
        </button>

        <button
          className={`btn ${
            view === "FACULTY" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => {
            setView("FACULTY");
            setSelectedStudent(null);
          }}
        >
          Faculty
        </button>
      </div>

      {/* STUDENTS VIEW */}
      {view === "STUDENTS" && (
        <div className="card p-3">
          <h5 className="mb-3">Students</h5>

          {/* FILTERS */}
          <div className="row mb-3">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dept</th>
                <th>Batch</th>
                <th>Roll</th>
                <th>Total Marks</th>
                <th>Actions</th>
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
                        className="btn btn-sm btn-info me-2"
                        onClick={() => setSelectedStudent(s)}
                      >
                        View
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteUser(s._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* STUDENT DETAILS */}
          {selectedStudent && (
            <div className="mt-4">
              <h5>{selectedStudent.name} - Task Overview</h5>

              <table className="table table-sm table-bordered mt-3">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions
                    .filter((s) => s.studentId === selectedStudent._id)
                    .map((sub) => {
                      const task = tasks.find((t) => t._id === sub.taskId);

                      return (
                        <tr key={sub._id}>
                          <td>{task?.title}</td>
                          <td>{sub.status}</td>
                          <td>{sub.marks ?? "-"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FACULTY VIEW */}
      {view === "FACULTY" && (
        <div className="card p-3">
          <h5 className="mb-3">Faculty</h5>

          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Dept</th>
                <th>Tasks Given</th>
                <th>Actions</th>
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
                        className="btn btn-sm btn-info me-2"
                        onClick={() => setSelectedFaculty(f)}
                      >
                        View
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteUser(f._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {selectedFaculty && (
            <div className="mt-4">
              <h5>{selectedFaculty.name} - Task Distribution</h5>

              {tasks
                .filter((t) => t.facultyId === selectedFaculty._id)
                .map((task) => {
                  const taskSubs = submissions.filter(
                    (s) => s.taskId === task._id,
                  );

                  return (
                    <div key={task._id} className="card p-3 mb-3">
                      <h6>{task.title}</h6>

                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Status</th>
                            <th>Marks</th>
                          </tr>
                        </thead>

                        <tbody>
                          {taskSubs.map((sub) => {
                            const student = students.find(
                              (s) => s._id === sub.studentId,
                            );

                            return (
                              <tr key={sub._id}>
                                <td>{student?.name}</td>
                                <td>{sub.status}</td>
                                <td>{sub.marks ?? "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
