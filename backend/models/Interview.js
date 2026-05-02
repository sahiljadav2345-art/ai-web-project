// ─── Interview Session Model ─────────────────────────────────────────────────
const mongoose = require("mongoose");

// Each Q&A pair within a session
const qaSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String, default: "" },
  aiFeedback: { type: String, default: "" },
});

const interviewSchema = new mongoose.Schema(
  {
    // Link to the user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // All Q&A pairs for this session
    questions: [qaSchema],
    // Quick summary label shown in history
    summary: {
      type: String,
      default: "Interview Session",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
