const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const {
  addUser,
  getAllUsers,
  sendAnnouncement,
} = require("../controllers/admin.controller");

router.post("/add-user", auth, rbac("admin"), addUser);
router.get("/users", auth, rbac("admin"), getAllUsers);
router.post("/announce", auth, rbac("admin"), sendAnnouncement);

module.exports = router;
