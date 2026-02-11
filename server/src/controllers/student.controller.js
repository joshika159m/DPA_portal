const Task = require("../models/Task");
const Submission = require("../models/Submission");
const User = require("../models/User");

/* ================= GET STUDENT TASKS ================= */
exports.getMyTasks = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    const tasks = await Task.find({
      $and: [
        {
          $or: [{ targetDept: { $size: 0 } }, { targetDept: student.dept }],
        },
        {
          $or: [{ targetBatch: { $size: 0 } }, { targetBatch: student.batch }],
        },
        {
          $or: [
            { targetRollRange: null },
            {
              "targetRollRange.from": { $lte: Number(student.rollNo) },
              "targetRollRange.to": { $gte: Number(student.rollNo) },
            },
          ],
        },
      ],
    });

    const submissions = await Submission.find({
      studentId: student._id,
    }).populate("taskId", "title");

    res.json({ tasks, submissions });
  } catch (err) {
    console.log("TASK FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SUBMIT / RESUBMIT TASK ================= */
exports.submitTask = async (req, res) => {
  try {
    const { taskId, contentUrl } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const submissionTime = new Date();
    let status = "ON_TIME";

    const deadline = new Date(task.deadline);
    const lateLimit = new Date(deadline.getTime() + 24 * 60 * 60 * 1000);

    if (submissionTime > deadline && submissionTime <= lateLimit) {
      status = "LATE";
    } else if (submissionTime > lateLimit) {
      status = "VERY_LATE";
    }

    // IMPORTANT: overwrite submission instead of creating new one
    const submission = await Submission.findOneAndUpdate(
      {
        taskId,
        studentId: req.user.id,
      },
      {
        contentType: "LINK",
        contentUrl,
        submissionTime,
        status,
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.json({ message: "Submission saved", submission });
  } catch (err) {
    console.log("SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Submission failed" });
  }
};
