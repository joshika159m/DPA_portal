const Message = require("../models/Message");
const Notification = require("../models/Notification");

exports.sendMessage = async (req, res) => {
  const { receiver, content, relatedTask } = req.body;

  try {
    const msg = await Message.create({
      sender: req.user.id,
      receiver,
      content,
      relatedTask,
    });

    await Notification.create({
      user: receiver,
      message: "New message received",
    });

    res.status(201).json(msg);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const msgs = await Message.find({
      receiver: req.user.id,
    }).populate("sender", "name role");

    res.json(msgs);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
