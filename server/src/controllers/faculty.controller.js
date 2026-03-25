const Task = require("../models/Task");
const Submission = require("../models/Submission");
const Notification = require("../models/Notification");
const User = require("../models/User");

/* CREATE TASK */
exports.createTask = async (req, res) => {
  try {
    let {
      title,
      description,
      targetDept,
      targetBatch,
      targetRollRange,
      selectedStudents,
      deadline,
      resubmissionDeadline,
      allowResubmission,
    } = req.body;

    /* -------- REQUIRED FIELD VALIDATION -------- */

    if (!title || !description || !deadline) {
      return res.status(400).json({
        message: "Title, description and deadline are required",
      });
    }

    /* -------- NORMALIZE INPUT -------- */

    if (!Array.isArray(targetDept)) targetDept = targetDept ? [targetDept] : [];
    if (!Array.isArray(targetBatch))
      targetBatch = targetBatch ? [targetBatch] : [];
    if (!Array.isArray(selectedStudents))
      selectedStudents = selectedStudents || [];

    /* -------- ROLL RANGE VALIDATION -------- */

    let rollRange = null;

    if (targetRollRange && targetRollRange.from && targetRollRange.to) {
      const from = parseInt(targetRollRange.from);
      const to = parseInt(targetRollRange.to);

      if (!isNaN(from) && !isNaN(to)) {
        rollRange = { from, to };
      }
    }

    /* -------- TARGET CHECK -------- */

    const hasDept = targetDept.length > 0;
    const hasBatch = targetBatch.length > 0;
    const hasRollRange = rollRange !== null;
    const hasStudents = selectedStudents.length > 0;

    if (!hasDept && !hasBatch && !hasRollRange && !hasStudents) {
      return res.status(400).json({
        message:
          "Select at least one target: Department, Batch, Roll Range, or Students",
      });
    }

    /* -------- CREATE TASK -------- */

    const task = await Task.create({
      title,
      description,
      facultyId: req.user.id,
      targetDept,
      targetBatch,
      targetRollRange: rollRange,
      targetStudents: selectedStudents,
      deadline,
      resubmissionDeadline,
      allowResubmission,
    });

    /* -------- NOTIFICATION -------- */

    let students = [];

    if (selectedStudents.length > 0) {
      students = await User.find({ _id: { $in: selectedStudents } });
    } else {
      students = await User.find({ role: "STUDENT" });
    }

    for (const student of students) {
      await Notification.create({
        userId: student._id,
        message: `New Task Assigned: ${title}`,
        type: "TASK",
      });
    }

    res.status(201).json(task);
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

exports.reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { remarks } = req.body;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.remarks = remarks;
    submission.reviewStatus = "REVIEWED";

    await submission.save();

    res.json(submission);
  } catch (err) {
    console.error("REVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to review submission" });
  }
};

/* FINALIZE MARKS */
exports.finalizeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks } = req.body;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.marks = marks;
    submission.reviewStatus = "FINALIZED";

    await submission.save();

    /* SEND NOTIFICATION */
    await Notification.create({
      userId: submission.studentId,
      message: "Your submission has been graded",
      type: "GRADE",
    });

    res.json(submission);
  } catch (err) {
    console.error("FINALIZE ERROR:", err);
    res.status(500).json({ message: "Failed to finalize marks" });
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

/* GET STUDENTS BY FILTER */
exports.getStudentsByFilter = async (req, res) => {
  try {
    const { dept, batch } = req.query;

    const filter = { role: "STUDENT" };

    if (dept) filter.dept = dept;
    if (batch) filter.batch = batch;

    const students = await User.find(filter)
      .select("name rollNo dept batch")
      .sort({ rollNo: 1 });

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
