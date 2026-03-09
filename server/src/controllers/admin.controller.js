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

    res.json({
      message: "User created",
      userId: user._id,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// ================= GET USERS (FILTER BY ROLE/BATCH/DEPT) =================
exports.getUsers = async (req, res) => {
  try {
    const { role, batch, dept } = req.query;

    let filter = {};

    if (role) filter.role = role;
    if (batch) filter.batch = batch;
    if (dept) filter.dept = dept;

    const users = await User.find(filter).select("-password");

    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ================= BLOCK USER =================
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;

    await user.save();

    res.json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);
    res.status(500).json({ message: "Failed to block user" });
  }
};

// ================= DELETE USER =================
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// ================= ADMIN OVERVIEW =================
exports.getAllData = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const tasks = await Task.find();
    const submissions = await Submission.find();

    res.json({
      users,
      tasks,
      submissions,
    });
  } catch (error) {
    console.error("ADMIN OVERVIEW ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL TASKS =================
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("faculty", "name email");

    res.status(200).json(tasks);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// ================= GET ALL SUBMISSIONS =================
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("student", "name email")
      .populate("task", "title");

    res.status(200).json(submissions);
  } catch (err) {
    console.error("GET SUBMISSIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

// ================= FACULTY HISTORY =================
exports.getFacultyHistory = async (req, res) => {
  try {
    const facultyId = req.params.id;

    const tasks = await Task.find({
      faculty: facultyId,
    });

    res.json(tasks);
  } catch (error) {
    console.error("FACULTY HISTORY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch faculty history" });
  }
};

// ================= STUDENT PERFORMANCE =================
exports.getStudentPerformance = async (req, res) => {
  try {
    const studentId = req.params.id;

    const submissions = await Submission.find({
      student: studentId,
    }).populate("task", "title deadline");

    const totalMarks = submissions.reduce(
      (sum, sub) => sum + (sub.marks || 0),
      0,
    );

    const completedTasks = submissions.length;

    res.json({
      submissions,
      totalMarks,
      completedTasks,
    });
  } catch (error) {
    console.error("STUDENT PERFORMANCE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch student performance" });
  }
};
