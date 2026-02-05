const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const {
  reviewSubmission,
  getMySubmissions,
} = require("../controllers/submission.controller");

const {
  submitProject,
  getTaskSubmissions,
} = require("../controllers/submission.controller");

router.post("/submit", auth, rbac("student"), submitProject);
router.get("/task/:taskId", auth, rbac("faculty", "admin"), getTaskSubmissions);
router.put("/review/:id", auth, rbac("faculty"), reviewSubmission);
router.get("/my", auth, rbac("student"), getMySubmissions);

module.exports = router;
