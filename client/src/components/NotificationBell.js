import { useEffect, useState } from "react";
import api from "../api/axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data);
    });
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-light" onClick={() => setShow(!show)}>
        🔔 ({notifications.length})
      </button>

      {show && (
        <div
          className="card"
          style={{
            position: "absolute",
            right: 0,
            width: "300px",
            zIndex: 999,
          }}
        >
          <div className="card-body">
            {notifications.length === 0 && <p>No notifications</p>}

            {notifications.map((n) => (
              <div key={n._id} className="border-bottom p-2">
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
