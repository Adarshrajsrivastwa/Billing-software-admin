import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as logoutApi } from "../services/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStored = localStorage.getItem("user");

    if (!token && !userStored) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data.user);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginUser = (accessToken, userData) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await logoutApi();
    } catch {
      // clear local session even if API fails
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
