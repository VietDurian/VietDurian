// context/AuthContext.js
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

import { profileAPI } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // 👈 new
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token"); // 👈 load token

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse auth_user", error);
        localStorage.removeItem("auth_user");
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }

    if (!storedToken) {
      setLoading(false);
      return;
    }

    refreshProfile().finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, authToken) => {
    // Save to localStorage
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", authToken); // 👈 save token

    setUser(userData);
    setToken(authToken); // 👈 update state
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token"); // 👈 clear token

    setUser(null);
    setToken(null);

    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshProfile,
        setUserUnsafe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
