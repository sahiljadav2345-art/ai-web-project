// ─── Auth Context ─────────────────────────────────────────────────────────────
// Provides user state and login/logout to all components
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Check localStorage on startup

  // On mount: restore user session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("mockprep_token");
    const savedUser = localStorage.getItem("mockprep_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Call this after successful login/register
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("mockprep_token", jwtToken);
    localStorage.setItem("mockprep_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mockprep_token");
    localStorage.removeItem("mockprep_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
