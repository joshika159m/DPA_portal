const Task = require("../models/Task");
const User = require("../models/User");
const Submission = require("../models/Submission");

exports.createTask = async (req, res) => {
  const { title, description, deadline, students } = req.body;

  if (!students || students.length === 0) {
    return res.status(400).json({ message: "No students selected" });
  }

  try {
    const task = await Task.create({
      title,
      description,
      deadline,
      faculty: req.user.id,
      students,
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ faculty: req.user.id }).populate(
      "students",
      "name email",
    );
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email");
    res.json(students);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTaskSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      task: req.params.taskId,
    }).populate("student", "name email");
    res.json(submissions);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
