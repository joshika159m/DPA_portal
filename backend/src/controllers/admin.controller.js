const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Notification = require("../models/Notification");

exports.addUser = async (req, res) => {
  const { name, email, role, dept, rollNo, batch } = req.body;

  const tempPassword = "welcome123";
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    name,
    email,
    role,
    dept,
    rollNo,
    batch,
    password: hashedPassword,
  });

  res.status(201).json({ user, tempPassword });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password",
    );
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendAnnouncement = async (req, res) => {
  const { message } = req.body;

  try {
    const users = await User.find({ role: { $ne: "admin" } });

    const notifications = users.map((u) => ({
      user: u._id,
      message,
    }));

    await Notification.insertMany(notifications);
    res.json({ message: "Announcement sent" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
