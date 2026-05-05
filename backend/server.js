const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ─── Validate Required Environment Variables ────────────────────────────────
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error("❌ Missing required env vars:", missingVars);
}

// ─── Middleware ─────────────────────────────────────────────────────────────
// Using a simple cors() is best for Vercel Services as frontend/backend share a domain
app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/resume",    require("./routes/resume"));
app.use("/api/interview", require("./routes/interview"));
app.use("/api/history",   require("./routes/history"));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "MockPrep API is running!" }));

// ─── MongoDB Connection ─────────────────────────────────────────────────────
// In a serverless environment, we initiate the connection but don't
// strictly need to wait for it before exporting the app.
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
    });
} else {
  console.error("❌ MONGO_URI not set");
}

// ─── Start Server (Local Only) ──────────────────────────────────────────────
// Vercel manages the execution environment and port.
// This block ensures the server still works on your local machine.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local server running on port ${PORT}`));
}

// ─── Export for Vercel ──────────────────────────────────────────────────────
// CRITICAL: Vercel's Express service requires the app instance to be exported.
module.exports = app;
