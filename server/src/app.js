const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://dpa-portal-s6t8.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());

/* ===== ROUTES ===== */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/faculty", require("./routes/faculty.routes"));
app.use("/api/student", require("./routes/student.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
module.exports = app;
