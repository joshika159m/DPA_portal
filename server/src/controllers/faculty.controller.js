const Task = require("../models/Task");
const Submission = require("../models/Submission");

/* CREATE TASK */
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      targetDept,
      targetBatch,
      targetRollRange,
      deadline,
    } = req.body;

    const task = await Task.create({
      title,
      description,
      facultyId: req.user.id, // KEEP THIS
      targetDept,
      targetBatch,
      targetRollRange,
      deadline,
    });

    res.json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

/* GET TASK SUBMISSIONS */
exports.getTaskSubmissions = async (req, res) => {
  try {
    const { taskId } = req.params;

    const submissions = await Submission.find({ taskId })
      .populate("studentId", "name rollNo dept batch")
      .populate("taskId", "title");

    res.json(submissions);
  } catch {
    res.status(500).json({ message: "Failed to load submissions" });
  }
};

/* GRADE */
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { marks },
      { new: true },
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    console.error("GRADE ERROR:", err);
    res.status(500).json({ message: "Failed to update marks" });
  }
};

/* FACULTY OVERVIEW */
exports.getFacultyOverview = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const tasks = await Task.find({ facultyId });

    const submissions = await Submission.find({
      taskId: { $in: tasks.map((t) => t._id) },
    })
      .populate("studentId", "name rollNo dept batch")
      .populate("taskId", "title");

    res.json({ tasks, submissions });
  } catch (err) {
    console.error("FACULTY OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load overview" });
  }
};

const User = require("../models/User");

/* GET STUDENTS BY FILTER */
exports.getStudentsByFilter = async (req, res) => {
  try {
    const { dept, batch } = req.query;

    const filter = { role: "STUDENT" };

    if (dept) filter.dept = dept;
    if (batch) filter.batch = batch;

    const students = await User.find(filter).select("name rollNo dept batch");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* GET DEPT + BATCH LIST */
exports.getFilterData = async (req, res) => {
  try {
    const students = await User.find({ role: "STUDENT" });

    const depts = [...new Set(students.map((s) => s.dept))];
    const batches = [...new Set(students.map((s) => s.batch))];

    res.json({ depts, batches });
  } catch {
    res.status(500).json({ message: "Failed to load filters" });
  }
};
