const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { createUser, getAllData } = require("../controllers/admin.controller");

router.post("/create-user", auth, role("ADMIN"), createUser);
router.get("/overview", auth, role("ADMIN"), getAllData);

module.exports = router;
