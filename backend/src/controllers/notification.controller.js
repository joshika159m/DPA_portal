const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
