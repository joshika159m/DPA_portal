const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["submitted", "late", "reviewed"],
      default: "submitted",
    },
    remarks: String,
    marks: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Submission", submissionSchema);
