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

    // deadline status
    status: {
      type: String,
      enum: ["ON_TIME", "LATE", "VERY_LATE"],
    },

    // submission workflow state
    reviewStatus: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED", "RESUBMITTED", "FINALIZED"],
      default: "SUBMITTED",
    },

    // faculty feedback
    remarks: {
      type: String,
      default: "",
    },

    // final marks
    marks: {
      type: Number,
      default: null,
    },

    // number of resubmissions
    resubmissionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Submission", submissionSchema);
