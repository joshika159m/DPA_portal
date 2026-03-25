const Task = require("../models/Task");
const Submission = require("../models/Submission");
const User = require("../models/User");

/* ================= GET STUDENT TASKS ================= */
exports.getMyTasks = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    let roll = parseInt(student.rollNo, 10);
    if (isNaN(roll)) roll = -1;

    const tasks = await Task.find({
      $or: [
        { targetStudents: student._id },

        {
          $and: [
            {
              $or: [
                { targetStudents: { $exists: false } },
                { targetStudents: { $size: 0 } },
              ],
            },

            {
              $or: [{ targetDept: { $size: 0 } }, { targetDept: student.dept }],
            },

            {
              $or: [
                { targetBatch: { $size: 0 } },
                { targetBatch: student.batch },
              ],
            },

            {
              $or: [
                { targetRollRange: null },
                { "targetRollRange.from": null },
                {
                  $and: [
                    { "targetRollRange.from": { $lte: roll } },
                    { "targetRollRange.to": { $gte: roll } },
                  ],
                },
              ],
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

    /* RESUBMISSION LOGIC */
    if (submissionTime <= deadline) {
      status = "ON_TIME";
    } else if (
      task.allowResubmission &&
      task.resubmissionDeadline &&
      submissionTime <= new Date(task.resubmissionDeadline)
    ) {
      status = "RESUBMITTED";
    } else {
      status = "VERY_LATE";
    }

    let submission = await Submission.findOne({
      taskId,
      studentId: req.user.id,
    });

    if (!submission) {
      submission = await Submission.create({
        taskId,
        studentId: req.user.id,
        contentType: "LINK",
        contentUrl,
        submissionTime,
        status,
        reviewStatus: "SUBMITTED",
        resubmissionCount: 0,
      });
    } else {
      submission.contentUrl = contentUrl;
      submission.submissionTime = submissionTime;
      submission.status = status;

      submission.reviewStatus = "RESUBMITTED";
      submission.resubmissionCount += 1;

      submission.marks = null;
      submission.remarks = "";

      await submission.save();
    }

    res.json({
      message: "Submission saved",
      submission,
    });
  } catch (err) {
    console.log("SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Submission failed" });
  }
};
