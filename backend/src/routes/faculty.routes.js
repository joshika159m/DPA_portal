const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const {
  createTask,
  getMyTasks,
  getAllStudents,
} = require("../controllers/faculty.controller");

router.post("/task", auth, rbac("faculty"), createTask);
router.get("/tasks", auth, rbac("faculty"), getMyTasks);
router.get("/students", auth, rbac("faculty"), getAllStudents);

module.exports = router;
