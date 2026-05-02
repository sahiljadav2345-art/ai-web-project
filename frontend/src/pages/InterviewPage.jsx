// ─── Interview Page ───────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import api from "../utils/api";

// ─── Step: Upload Resume ──────────────────────────────────────────────────────
function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="page-title">Upload <span>Resume</span></h1>
      <p className="page-subtitle">We'll analyze your resume and generate tailored interview questions.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {/* Drop zone */}
        <div
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            marginBottom: "20px",
            cursor: "pointer",
            transition: "border-color 0.2s",
            borderColor: file ? "var(--accent)" : "var(--border)",
          }}
          onClick={() => document.getElementById("resume-input").click()}
        >
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📄</div>
          {file ? (
            <div>
              <p style={{ color: "var(--accent)", fontWeight: "500" }}>{file.name}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text-muted)" }}>Click to select your resume</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>
                PDF or TXT, max 5MB
              </p>
            </div>
          )}
        </div>

        <input
          id="resume-input"
          type="file"
          accept=".pdf,.txt"
          style={{ display: "none" }}
          onChange={(e) => { setFile(e.target.files[0]); setError(""); }}
        />

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? <><span className="spinner" /> Analyzing...</> : "Upload & Continue"}
        </button>
      </div>
    </div>
  );
}

// ─── Voice Recorder Component ─────────────────────────────────────────────────
function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported] = useState(() => "SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  if (!supported) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        ⚠️ Voice not supported in this browser. Type your answer below.
      </p>
    );
  }

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className="btn btn-secondary"
      style={{
        borderColor: isRecording ? "var(--danger)" : "var(--border)",
        color: isRecording ? "var(--danger)" : "var(--text)",
      }}
    >
      {isRecording ? "⏹ Stop Recording" : "🎤 Record Answer"}
      {isRecording && (
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--danger)",
            animation: "pulse 1s ease-in-out infinite",
            display: "inline-block",
          }}
        />
      )}
    </button>
  );
}

// ─── Single Question Card ──────────────────────────────────────────────────────
function QuestionCard({ item, index, interviewId, onFeedbackReceived }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(item.aiFeedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetFeedback = async () => {
    if (!answer.trim()) return setError("Please provide an answer first");
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/interview/feedback", {
        interviewId,
        questionId: item._id,
        question: item.question,
        answer,
      });
      setFeedback(data.feedback);
      onFeedbackReceived();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      {/* Question header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "18px" }}>
        <span
          className="badge badge-accent"
          style={{ minWidth: "32px", textAlign: "center" }}
        >
          Q{index + 1}
        </span>
        <p style={{ fontWeight: "500", lineHeight: "1.5" }}>{item.question}</p>
      </div>

      <hr className="divider" />

      {/* Voice + text answer */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Your Answer
          </label>
          <VoiceRecorder
            onTranscript={(text) => setAnswer((prev) => (prev ? prev + " " + text : text))}
          />
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type or use voice to record your answer..."
          rows={4}
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "12px",
            color: "var(--text)",
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            resize: "vertical",
            outline: "none",
          }}
        />
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "12px" }}>{error}</div>}

      {/* Get Feedback button */}
      {!feedback && (
        <button
          className="btn btn-secondary"
          onClick={handleGetFeedback}
          disabled={loading || !answer.trim()}
        >
          {loading ? <><span className="spinner" /> Getting feedback...</> : "✨ Get AI Feedback"}
        </button>
      )}

      {/* AI Feedback section */}
      {feedback && (
        <div
          style={{
            background: "rgba(110, 231, 183, 0.06)",
            border: "1px solid rgba(110, 231, 183, 0.2)",
            borderRadius: "8px",
            padding: "16px",
            marginTop: "14px",
          }}
        >
          <p style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ✨ AI Feedback
          </p>
          <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: "1.65", whiteSpace: "pre-wrap" }}>
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Interview Page ───────────────────────────────────────────────────────
export default function InterviewPage() {
  const [hasResume, setHasResume] = useState(null); // null = checking
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);

  // Check if user already has a resume on file
  useEffect(() => {
    api.get("/resume").then(({ data }) => setHasResume(data.hasResume));
  }, []);

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const { data } = await api.post("/interview/start");
      setInterviewId(data.interviewId);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (hasResume === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <div className="spinner" />
      </div>
    );
  }

  // Show resume upload if no resume
  if (!hasResume) {
    return <ResumeUpload onUploadSuccess={() => setHasResume(true)} />;
  }

  // Main interview UI
  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="page-title">
            AI <span>Interview</span>
          </h1>
          <p className="page-subtitle">
            {questions.length > 0
              ? `${answeredCount} of ${questions.length} questions answered`
              : "Start a new interview session based on your resume"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Option to re-upload resume */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setHasResume(false)}
          >
            Change Resume
          </button>

          <button
            className="btn btn-primary"
            onClick={startInterview}
            disabled={loading}
            style={{ width: "auto" }}
          >
            {loading ? (
              <><span className="spinner" /> Generating...</>
            ) : questions.length > 0 ? (
              "🔄 New Session"
            ) : (
              "🚀 Start Interview"
            )}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading state */}
      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-muted)" }}>
            Analyzing your resume and generating questions...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && questions.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤖</div>
          <h2 style={{ marginBottom: "10px", color: "var(--text)" }}>Ready when you are</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "360px", margin: "0 auto 24px" }}>
            Click "Start Interview" to generate 7 personalized questions based on your resume.
          </p>
        </div>
      )}

      {/* Questions */}
      {!loading && questions.map((item, i) => (
        <QuestionCard
          key={item._id}
          item={item}
          index={i}
          interviewId={interviewId}
          onFeedbackReceived={() => setAnsweredCount((c) => c + 1)}
        />
      ))}

      {/* Completion message */}
      {questions.length > 0 && answeredCount === questions.length && (
        <div className="card" style={{ textAlign: "center", padding: "30px", background: "rgba(110,231,183,0.06)", borderColor: "rgba(110,231,183,0.2)" }}>
          <p style={{ color: "var(--accent)", fontSize: "1.1rem", fontWeight: "500" }}>
            🎉 Interview Complete! Check your History page to review this session.
          </p>
        </div>
      )}

      {/* CSS for recording pulse animation */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
