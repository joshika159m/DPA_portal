const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // 🔴 THIS IS THE CRITICAL LINE
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role, // 👈 MUST EXIST
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES },
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
