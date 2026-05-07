// ─── Auth Page (Login + Register) ─────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);

      // Show success animation
      setSuccess(true);

      // Save user to context + localStorage
      login(data.user, data.token);

      // Redirect after animation completes
      setTimeout(() => {
        navigate("/interview");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 65px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {/* Success overlay animation */}
      {success && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 30, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-out",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            {/* Checkmark SVG */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              style={{ animation: "checkmarkDraw 0.6s ease-out 0.2s both" }}
            >
              <circle cx="40" cy="40" r="36" />
              <path d="M20 40 L35 55 L60 25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ color: "var(--accent)", fontSize: "1.1rem", marginTop: "20px", fontWeight: "500" }}>
              {mode === "login" ? "Welcome back!" : "Account created!"}
            </p>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="page-title" style={{ fontSize: "2rem", marginBottom: "8px" }}>
            <span>MockPrep</span>
          </h1>
          <p className="page-subtitle">AI-powered interview preparation</p>

          {/* Mode toggle */}
          <div
            style={{
              display: "inline-flex",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "4px",
              gap: "4px",
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="btn"
                style={{
                  padding: "7px 20px",
                  background: mode === m ? "var(--accent)" : "transparent",
                  color: mode === m ? "#0a0f1e" : "var(--text-muted)",
                  fontWeight: mode === m ? "600" : "400",
                  fontSize: "0.88rem",
                }}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Name field (register only) */}
            {mode === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            {mode === "login" && (
              <div style={{ textAlign: "right", marginBottom: "18px", marginTop: "-10px" }}>
                <Link
                  to="/forgot-password"
                  style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}
                  onMouseOver={(e) => (e.target.style.color = "var(--accent)")}
                  onMouseOut={(e) => (e.target.style.color = "var(--text-muted)")}
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading || success}>
              {loading ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: "circularSpin 1s linear infinite" }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              ) : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "20px", fontSize: "0.85rem" }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.85rem" }}
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
