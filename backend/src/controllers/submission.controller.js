const Submission = require("../models/Submission");
const Task = require("../models/Task");

exports.submitProject = async (req, res) => {
  const { taskId, fileUrl } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isLate = new Date() > new Date(task.deadline);

    const submission = await Submission.create({
      task: taskId,
      student: req.user.id,
      fileUrl,
      status: isLate ? "late" : "submitted",
    });

    res.status(201).json(submission);
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
