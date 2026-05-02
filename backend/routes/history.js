// ─── History Routes ───────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Interview = require("../models/Interview");

// ─── GET /api/history ─────────────────────────────────────────────────────────
// Get all past interviews for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .select("summary createdAt questions"); // Only send needed fields

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/history/:id ─────────────────────────────────────────────────────
// Get a single interview session detail
router.get("/:id", protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id, // Ensure user can only see their own data
    });

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/history/:id ──────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    await Interview.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
