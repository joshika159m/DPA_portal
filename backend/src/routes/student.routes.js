const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const { getMyTasks } = require("../controllers/student.controller");

router.get("/tasks", auth, rbac("student"), getMyTasks);

module.exports = router;
