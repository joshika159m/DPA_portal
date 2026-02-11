const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // 🔥 REQUIRED for localhost
    });

    // 🔥 FIX IS HERE
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dept: user.dept,
      batch: user.batch,
      rollNo: user.rollNo,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "name email role dept batch rollNo",
  );

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    dept: user.dept,
    batch: user.batch,
    rollNo: user.rollNo,
  });
};
