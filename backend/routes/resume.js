// ─── Resume Routes ────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// Store uploaded file in memory (no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // Accept PDF and plain text files only
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or text files are allowed"));
    }
  },
});

// ─── POST /api/resume/upload ──────────────────────────────────────────────────
router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      // Extract text from PDF buffer
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else {
      // Plain text file - just convert buffer to string
      extractedText = req.file.buffer.toString("utf-8");
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ message: "Could not extract text from file. Try a text-based PDF." });
    }

    // Save extracted text to user's profile
    await User.findByIdAndUpdate(req.user._id, { resumeText: extractedText });

    res.json({
      message: "Resume uploaded successfully",
      preview: extractedText.substring(0, 200) + "...", // Show first 200 chars
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/resume ──────────────────────────────────────────────────────────
// Check if user has uploaded a resume
router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ hasResume: !!user.resumeText });
});

module.exports = router;
