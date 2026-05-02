# 🎤 MockPrep – AI Interview Coach

A full-stack MERN app that analyzes your resume and conducts AI-powered mock interviews using Google Gemini.

---

## ✨ Features

- **JWT Auth** – Signup, login, protected routes
- **Forgot Password** – Email-based reset via Nodemailer
- **Resume Upload** – PDF/TXT → text extraction with pdf-parse
- **AI Questions** – Google Gemini generates 7 tailored questions from your resume
- **Voice Answers** – Web Speech API (speak your answer, text appears automatically)
- **AI Feedback** – Gemini evaluates each answer with improvement tips
- **Interview History** – Review past sessions with all Q&A and feedback

---

## 📁 Project Structure

```
mockprep/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema + password hashing
│   │   └── Interview.js     # Interview session schema
│   ├── routes/
│   │   ├── auth.js          # Login, register, forgot/reset password
│   │   ├── resume.js        # Resume upload + text extraction
│   │   ├── interview.js     # AI question generation + feedback
│   │   └── history.js       # Interview history CRUD
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── utils/
│   │   ├── gemini.js        # Google Gemini API calls
│   │   └── sendEmail.js     # Nodemailer email utility
│   ├── server.js            # Express app entry point
│   ├── package.json
│   └── .env.example         # ← Copy this to .env and fill in values
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state (user, token)
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   └── ProtectedRoute.jsx # Auth guard
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx           # Login + Register
│   │   │   ├── ForgotPasswordPage.jsx # Request reset email
│   │   │   ├── ResetPasswordPage.jsx  # Set new password
│   │   │   ├── InterviewPage.jsx      # Resume upload + interview
│   │   │   └── HistoryPage.jsx        # Past sessions
│   │   ├── utils/
│   │   │   └── api.js           # Axios with auto-auth header
│   │   ├── App.jsx              # Routes
│   │   ├── main.jsx             # React entry
│   │   └── index.css            # Dark theme styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup Guide

### Step 1 – Get a Free Gemini API Key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)
5. The free tier gives you **15 requests/minute** and **1 million tokens/day** — more than enough!

### Step 2 – Set Up MongoDB

**Option A: MongoDB Atlas (Free Cloud)**
1. Go to **https://www.mongodb.com/cloud/atlas**
2. Create a free account → Create a free M0 cluster
3. Under "Database Access", create a user with read/write permissions
4. Under "Network Access", add `0.0.0.0/0` (allow all) for development
5. Click "Connect" → "Connect your application" → copy the connection string
6. Replace `<password>` in the string with your actual password

**Option B: Local MongoDB**
```bash
# Install MongoDB locally, then use:
MONGO_URI=mongodb://localhost:27017/mockprep
```

### Step 3 – Set Up Gmail for Password Reset Emails

1. Go to your Google Account → Security → 2-Step Verification (enable it)
2. Then go to **https://myaccount.google.com/apppasswords**
3. Create an App Password for "Mail"
4. Copy the 16-character password (spaces don't matter)
5. Use that as `EMAIL_PASS` in your .env file

### Step 4 – Backend Setup

```bash
cd mockprep/backend

# Copy environment file and fill in your values
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, EMAIL_*, GEMINI_API_KEY

# Install dependencies
npm install

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### Step 5 – Frontend Setup

```bash
cd mockprep/frontend

# Install dependencies
npm install

# Start React dev server
npm run dev
# App runs on http://localhost:5173
```

### Step 6 – Open the App

Visit **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Any long random string for signing tokens |
| `JWT_EXPIRE` | Token expiry, e.g. `7d` |
| `EMAIL_HOST` | SMTP host, e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | Usually `587` for Gmail |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password (16 chars) |
| `GEMINI_API_KEY` | From Google AI Studio (free) |
| `FRONTEND_URL` | `http://localhost:5173` for local dev |
| `PORT` | Backend port, default `5000` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| AI | Google Gemini 1.5 Flash (free) |
| Voice | Web Speech API (browser built-in) |
| Email | Nodemailer + Gmail SMTP |
| PDF Parsing | pdf-parse |

---

## 💡 How It Works

1. **Register** → create account → **upload resume** (PDF or TXT)
2. Resume text is extracted and stored in MongoDB
3. Click **"Start Interview"** → Gemini analyzes your resume → generates 7 questions
4. For each question: **speak your answer** (or type it)
5. Click **"Get AI Feedback"** → Gemini evaluates and gives improvement tips
6. All sessions saved → view anytime in **History**

---

## 🐛 Common Issues

**"Failed to generate questions"**
- Check your `GEMINI_API_KEY` in .env
- Make sure you're using `gemini-1.5-flash` (free model)

**"Could not extract text from file"**
- Use a text-based PDF (not a scanned image PDF)
- Or upload a plain .txt file of your resume

**Voice not working**
- Use Chrome or Edge (Firefox has limited Web Speech API support)
- Allow microphone permission when prompted

**Email not sending**
- Make sure 2FA is enabled on Gmail before creating App Password
- Double-check `EMAIL_PASS` is the App Password, not your Gmail login password
