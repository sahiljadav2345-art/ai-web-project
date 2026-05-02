// ─── Navbar Component ─────────────────────────────────────────────────────────
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Mock<span>Prep</span>
        </Link>

        {/* Nav links - only show when logged in */}
        {user && (
          <div className="navbar-links">
            <Link to="/interview" className={isActive("/interview")}>
              Interview
            </Link>
            <Link to="/history" className={isActive("/history")}>
              History
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: "8px" }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
