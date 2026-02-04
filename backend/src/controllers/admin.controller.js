const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.addUser = async (req, res) => {
  const { name, email, role } = req.body;

  if (!["student", "faculty"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const tempPassword = "welcome123";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name,
      email,
      role,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created",
      tempPassword,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
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
