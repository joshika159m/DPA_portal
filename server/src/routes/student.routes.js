const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { getMyTasks, submitTask } = require("../controllers/student.controller");

router.get("/tasks", auth, role("STUDENT"), getMyTasks);
router.post("/submit", auth, role("STUDENT"), submitTask);
const upload = require("../middleware/upload.middleware");

module.exports = router;
