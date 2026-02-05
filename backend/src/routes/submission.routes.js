const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const {
  submitProject,
  getTaskSubmissions,
} = require("../controllers/submission.controller");

router.post("/submit", auth, rbac("student"), submitProject);
router.get("/task/:taskId", auth, rbac("faculty", "admin"), getTaskSubmissions);

module.exports = router;
