const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["LINK"],
      required: true,
    },
    contentUrl: String,
    submissionTime: Date,
    status: {
      type: String,
      enum: ["ON_TIME", "LATE", "VERY_LATE"],
    },
    marks: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Submission", submissionSchema);
