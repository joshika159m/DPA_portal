const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("admin", 10);

  const admin = await User.create({
    name: "Super Admin",
    email: "admin@campusflow.com",
    password: hashedPassword,
    role: "ADMIN",
  });

  console.log("Admin created:", admin.email);
  process.exit();
})();
