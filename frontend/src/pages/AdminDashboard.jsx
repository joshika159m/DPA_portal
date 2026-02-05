import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!auth?.token) return;

    axios
      .get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, [auth.token]);

  return (
    <>
      <h2>Admin Dashboard</h2>
      {users.map((u) => (
        <div key={u._id}>
          {u.name} - {u.role}
        </div>
      ))}
    </>
  );
};

export default AdminDashboard;
