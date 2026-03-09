const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const facultyController = require("../controllers/faculty.controller");

router.post("/task", auth, role("FACULTY"), facultyController.createTask);

router.get(
  "/submissions/:taskId",
  auth,
  role("FACULTY"),
  facultyController.getTaskSubmissions,
);

router.put(
  "/review/:submissionId",
  auth,
  role("FACULTY"),
  facultyController.reviewSubmission,
);

router.put(
  "/finalize/:submissionId",
  auth,
  role("FACULTY"),
  facultyController.finalizeSubmission,
);

router.get(
  "/overview",
  auth,
  role("FACULTY"),
  facultyController.getFacultyOverview,
);

router.get("/students", facultyController.getStudentsByFilter);

router.get("/filter-data", facultyController.getFilterData);

module.exports = router;
