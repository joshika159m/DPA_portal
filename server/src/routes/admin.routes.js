const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  createUser,
  getAllData,
  getAllTasks,
  getAllSubmissions,
  deleteUser,
  getUsers,
  blockUser,
  getFacultyHistory,
  getStudentPerformance,
} = require("../controllers/admin.controller");

router.post("/create-user", auth, role("ADMIN"), createUser);
router.get("/users", auth, role("ADMIN"), getUsers);
router.put("/block/:id", auth, role("ADMIN"), blockUser);
router.delete("/user/:id", auth, role("ADMIN"), deleteUser);
router.get("/overview", auth, role("ADMIN"), getAllData);
router.get("/tasks", auth, role("ADMIN"), getAllTasks);
router.get("/submissions", auth, role("ADMIN"), getAllSubmissions);
router.get("/faculty-history/:id", auth, role("ADMIN"), getFacultyHistory);
router.get(
  "/student-performance/:id",
  auth,
  role("ADMIN"),
  getStudentPerformance,
);

module.exports = router;
