const Task = require("../models/Task");
const User = require("../models/User");

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ students: req.user.id }).populate(
      "faculty",
      "name email",
    );
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyTasks = async (req, res) => {
  const student = await User.findById(req.user.id);

  const tasks = await Task.find({
    targetDept: student.dept,
    targetBatch: student.batch,
  });

  res.json(tasks);
};
