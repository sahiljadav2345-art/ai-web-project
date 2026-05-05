// ─── Interview Routes ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Interview = require("../models/Interview");
const { generateQuestions, generateFeedback } = require("../utils/gemini");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─── GET /api/interview/test-models (Debug endpoint) ──────────────────────────
router.get("/test-models", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await genAI.listModels();
    res.json({ models: models.map(m => m.name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/interview/start ────────────────────────────────────────────────
// Analyze resume and generate interview questions
router.post("/start", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.resumeText) {
      return res.status(400).json({ message: "Please upload your resume first" });
    }

    // Generate questions using Gemini AI
    const questionTexts = await generateQuestions(user.resumeText);

    // Create a new interview session in DB (answers/feedback added later)
    const interview = await Interview.create({
      user: user._id,
      questions: questionTexts.map((q) => ({ question: q })),
      summary: `Interview on ${new Date().toLocaleDateString()}`,
    });

    res.json({
      interviewId: interview._id,
      questions: interview.questions,
    });
  } catch (err) {
    console.error("Interview start error:", err);
    res.status(500).json({ message: "Failed to generate questions. Check your Gemini API key." });
  }
});

// ─── POST /api/interview/feedback ────────────────────────────────────────────
// Get AI feedback for a single answer
router.post("/feedback", protect, async (req, res) => {
  try {
    const { interviewId, questionId, question, answer } = req.body;

    if (!answer || answer.trim().length < 5) {
      return res.status(400).json({ message: "Answer is too short" });
    }

    // Generate feedback using Gemini AI
    const feedback = await generateFeedback(question, answer);

    // Save answer and feedback to the correct question in DB
    await Interview.findOneAndUpdate(
      { _id: interviewId, "questions._id": questionId },
      {
        $set: {
          "questions.$.userAnswer": answer,
          "questions.$.aiFeedback": feedback,
        },
      }
    );

    res.json({ feedback });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Failed to generate feedback." });
  }
});

module.exports = router;
