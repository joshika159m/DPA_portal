const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const { login, logout, getMe } = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, getMe);

module.exports = router;
