import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { profileAPI } from "@/lib/api";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // new
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isHandling401 = useRef(false);

  const setUserUnsafe = useCallback((nextUser) => {
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await profileAPI.getMe();
      const latestUser = res?.data ?? res?.user ?? res;

      if (latestUser && typeof latestUser === "object") {
        localStorage.setItem("auth_user", JSON.stringify(latestUser));
        setUser(latestUser);
      }

      return latestUser;
    } catch (error) {
      console.error("Failed to refresh profile", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token"); // load token

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
    } else {
      // No token: ensure we drop any stale user session
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth_user");
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData, authToken) => {
    // Save to localStorage
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", authToken); // save token

    setUser(userData);
    setToken(authToken); // update state
  }, []);

  const logout = useCallback(
    (redirectTo = "/login") => {
      setUser(null);
      setToken(null);
      const target = typeof redirectTo === "string" ? redirectTo : "/login";
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token"); // clear token

      setUser(null);
      setToken(null);

      // Keep Zustand auth state in sync to avoid login/dashboard redirect loops.
      useAuthStore.setState({ authUser: null });
      useAuthStore.getState().disconnectSocket();

      router.push(target);
    },
    [router],
  );

  // Bắt 401 toàn cục cho dashboard
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && !isHandling401.current) {
          isHandling401.current = true;

          const redirectPath = `${window.location.pathname}${window.location.search}`;
          const target =
            redirectPath && redirectPath !== "/login"
              ? `/login?redirect=${encodeURIComponent(redirectPath)}`
              : "/login";

          logout(target);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, [logout]);

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