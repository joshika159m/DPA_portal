import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Notifications = () => {
  const { auth } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setNotes(res.data));
  }, []);

  return (
    <>
      <h4>Notifications</h4>
      {notes.map((n) => (
        <div key={n._id}>{n.message}</div>
      ))}
    </>
  );
};

export default Notifications;
