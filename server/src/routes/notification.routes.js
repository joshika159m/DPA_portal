const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const {
  getNotifications,
  markAllRead,
} = require("../controllers/notification.controller");

router.get("/", auth, getNotifications);
router.put("/read-all", auth, markAllRead);
module.exports = router;
