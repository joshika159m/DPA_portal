const Task = require("../models/Task");

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
