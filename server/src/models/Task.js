const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, default: "" },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetDept: {
      type: [String],
      default: [],
    },

    targetBatch: {
      type: [String],
      default: [],
    },

    targetStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    targetRollRange: {
      from: { type: Number, default: null },
      to: { type: Number, default: null },
    },

    deadline: {
      type: Date,
      required: true,
    },

    /* NEW FIELD */
    resubmissionDeadline: {
      type: Date,
      default: null,
    },

    allowResubmission: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
