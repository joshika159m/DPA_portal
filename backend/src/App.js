const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/faculty", require("./routes/faculty.routes"));
app.use("/api/student", require("./routes/student.routes"));
app.use("/api/submission", require("./routes/submission.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

module.exports = app;
