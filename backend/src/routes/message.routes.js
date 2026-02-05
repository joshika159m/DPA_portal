const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const {
  sendMessage,
  getMyMessages,
} = require("../controllers/message.controller");

router.post("/", auth, sendMessage);
router.get("/", auth, getMyMessages);

module.exports = router;
