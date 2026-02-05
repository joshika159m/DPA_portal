const router = require("express").Router();
const {
  getMyNotifications,
} = require("../controllers/notification.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, getMyNotifications);

module.exports = router;
