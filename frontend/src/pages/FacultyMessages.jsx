import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const FacultyMessages = () => {
  const { auth } = useContext(AuthContext);
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/messages", {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      .then((res) => setMsgs(res.data));
  }, []);

  return (
    <>
      <h3>Messages</h3>
      {msgs.map((m) => (
        <div key={m._id}>
          <b>{m.sender.name}</b>: {m.content}
        </div>
      ))}
    </>
  );
};

export default FacultyMessages;
