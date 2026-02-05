const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    targetDept: String,
    targetBatch: String,
    targetRollRange: {
      start: String,
      end: String,
    },

    deadline: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
