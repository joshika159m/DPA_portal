const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const { addUser, getAllUsers } = require("../controllers/admin.controller");

router.post("/add-user", auth, rbac("admin"), addUser);
router.get("/users", auth, rbac("admin"), getAllUsers);

module.exports = router;
