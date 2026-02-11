const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  createTask,
  getTaskSubmissions,
  gradeSubmission,
  getFacultyOverview,
} = require("../controllers/faculty.controller");

router.post("/task", auth, role("FACULTY"), createTask);
router.get("/submissions/:taskId", auth, role("FACULTY"), getTaskSubmissions);
router.put("/grade/:submissionId", auth, role("FACULTY"), gradeSubmission);
router.get("/overview", auth, role("FACULTY"), getFacultyOverview);

module.exports = router;
