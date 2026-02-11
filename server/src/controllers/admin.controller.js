const User = require("../models/User");
const Task = require("../models/Task");
const Submission = require("../models/Submission");
const bcrypt = require("bcryptjs");

// ================= CREATE USER =================
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, dept, rollNo, batch } = req.body;

    const password = await bcrypt.hash("changeme123", 10);

    const user = await User.create({
      name,
      email,
      password,
      role,
      dept,
      rollNo,
      batch,
    });

    res.json({ message: "User created", userId: user._id });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// ================= ADMIN OVERVIEW =================
exports.getAllData = async (req, res) => {
  try {
    const users = await User.find();
    const tasks = await Task.find();
    const submissions = await Submission.find();

    res.json({ users, tasks, submissions });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
