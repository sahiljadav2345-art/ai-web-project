// ─── History Page ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import api from "../utils/api";

// ─── Single Interview Detail View ─────────────────────────────────────────────
function InterviewDetail({ interview, onClose }) {
  return (
    <div>
      {/* Back button */}
      <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ marginBottom: "24px" }}>
        ← Back to History
      </button>

      <h2 style={{ marginBottom: "6px", fontFamily: "var(--font-mono)", fontSize: "1.2rem" }}>
        {interview.summary}
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "28px" }}>
        {new Date(interview.createdAt).toLocaleString()}
      </p>

      {/* Q&A List */}
      {interview.questions.map((qa, i) => (
        <div key={qa._id} className="card" style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <span className="badge badge-accent">Q{i + 1}</span>
            <p style={{ fontWeight: "500" }}>{qa.question}</p>
          </div>

          {qa.userAnswer && (
            <div style={{ marginBottom: "14px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Your Answer
              </p>
              <p style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                {qa.userAnswer}
              </p>
            </div>
          )}

          {qa.aiFeedback && (
            <div
              style={{
                background: "rgba(110,231,183,0.06)",
                border: "1px solid rgba(110,231,183,0.2)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <p style={{ color: "var(--accent)", fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                ✨ AI Feedback
              </p>
              <p style={{ color: "var(--text)", fontSize: "0.88rem", lineHeight: "1.65", whiteSpace: "pre-wrap" }}>
                {qa.aiFeedback}
              </p>
            </div>
          )}

          {!qa.userAnswer && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontStyle: "italic" }}>
              Not answered
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── History List ──────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [selected, setSelected] = useState(null); // Full detail view
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/history");
      setInterviews(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load full detail for selected interview
  const viewDetail = async (id) => {
    try {
      const { data } = await api.get(`/history/${id}`);
      setSelected(data);
    } catch (err) {
      console.error("Failed to load interview:", err);
    }
  };

  const deleteInterview = async (id, e) => {
    e.stopPropagation(); // Don't trigger row click
    if (!confirm("Delete this interview session?")) return;

    try {
      await api.delete(`/history/${id}`);
      setInterviews((prev) => prev.filter((i) => i._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      {selected ? (
        <InterviewDetail interview={selected} onClose={() => setSelected(null)} />
      ) : (
        <>
          <h1 className="page-title">
            Interview <span>History</span>
          </h1>
          <p className="page-subtitle">Review your past sessions and AI feedback.</p>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
              <div className="spinner" />
            </div>
          )}

          {!loading && interviews.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "60px 40px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "14px" }}>📋</div>
              <h2 style={{ marginBottom: "8px" }}>No interviews yet</h2>
              <p style={{ color: "var(--text-muted)" }}>
                Complete your first interview to see it here.
              </p>
            </div>
          )}

          {/* Interview list */}
          {interviews.map((interview) => {
            const answeredCount = interview.questions.filter((q) => q.aiFeedback).length;
            const total = interview.questions.length;

            return (
              <div
                key={interview._id}
                className="card"
                onClick={() => viewDetail(interview._id)}
                style={{
                  marginBottom: "14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div>
                  <p style={{ fontWeight: "500", marginBottom: "4px" }}>
                    {interview.summary}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    {new Date(interview.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  {/* Progress indicator */}
                  <span
                    style={{
                      background: answeredCount === total
                        ? "rgba(110,231,183,0.15)"
                        : "var(--bg-input)",
                      color: answeredCount === total ? "var(--accent)" : "var(--text-muted)",
                      border: `1px solid ${answeredCount === total ? "rgba(110,231,183,0.3)" : "var(--border)"}`,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {answeredCount}/{total} answered
                  </span>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => deleteInterview(interview._id, e)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
