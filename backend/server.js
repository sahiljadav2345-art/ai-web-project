const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

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
