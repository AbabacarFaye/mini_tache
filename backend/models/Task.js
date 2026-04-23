const mongoose = require("mongoose");

const taskHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },

  note: {
    type: String,
    default: "",
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  deadline: Date,

  history: [taskHistorySchema],

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);