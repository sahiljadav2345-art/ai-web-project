// ─── Google Gemini AI Utility ─────────────────────────────────────────────────
// Uses @google/generative-ai package to call Gemini API
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !err.message?.includes("503")) throw err;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Generate interview questions based on resume text
 * @param {string} resumeText - Extracted text from user's resume
 * @returns {string[]} Array of interview questions
 */
const generateQuestions = async (resumeText) => {
  const prompt = `
You are an expert technical interviewer. Based on the resume below, generate 7 relevant interview questions.
Mix technical questions with behavioral ones. Keep each question concise (1-2 sentences).

Resume:
${resumeText}

Return ONLY a JSON array of question strings, no extra text. Example:
["Question 1?", "Question 2?", "Question 3?"]
`;

  return retryWithBackoff(async () => {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response and parse JSON
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  });
};

/**
 * Generate AI feedback on a user's interview answer
 * @param {string} question - The interview question
 * @param {string} answer - The user's spoken/typed answer
 * @returns {string} Short feedback with improvement tips
 */
const generateFeedback = async (question, answer) => {
  const prompt = `
You are an expert interview coach. Evaluate the following interview answer.

Question: ${question}
Answer: ${answer}

Provide concise feedback (3-5 sentences) covering:
1. What was good about the answer
2. What could be improved
3. One specific tip for a better answer

Keep the tone encouraging and constructive.
`;

  return retryWithBackoff(async () => {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  });
};

module.exports = { generateQuestions, generateFeedback };
