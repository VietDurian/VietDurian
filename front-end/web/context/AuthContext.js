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
import { axiosInstance } from "@/lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // new
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isHandling401 = useRef(false);

  const clearClientAuthState = useCallback(() => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");

    const cookieNames = ["accessToken", "refreshToken", "user_id"];
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    useAuthStore.setState({ authUser: null });
    useAuthStore.getState().disconnectSocket();
  }, []);

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
        useAuthStore.setState({ authUser: latestUser });
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
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        useAuthStore.setState({ authUser: parsedUser });
      } catch (error) {
        console.error("Failed to parse auth_user", error);
        localStorage.removeItem("auth_user");
        useAuthStore.setState({ authUser: null });
      }
    }

    if (storedToken) {
      setToken(storedToken);
    } else {
      // No token: ensure we drop any stale user session
      setUser(null);
      setToken(null);
      clearClientAuthState();
    }

    setLoading(false);
  }, [clearClientAuthState]);

  const login = useCallback((userData, authToken) => {
    // Save to localStorage
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", authToken); // save token

    setUser(userData);
    setToken(authToken); // update state
    useAuthStore.setState({ authUser: userData });
  }, []);

  const logout = useCallback(
    async (redirectTo = "/login") => {
      setUser(null);
      setToken(null);
      const target = typeof redirectTo === "string" ? redirectTo : "/login";

      try {
        await axiosInstance.post("/auth/logout");
      } catch (error) {
        console.error("Logout API failed", error);
      } finally {
        clearClientAuthState();
        isHandling401.current = false;
        router.replace(target);
      }
    },
    [clearClientAuthState, router],
  );

  // Bắt 401 toàn cục cho dashboard
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const currentPath = window.location.pathname;
        const protectedPrefixes = ["/dashboard", "/profile", "/chat", "/home"];
        const isProtectedPath = protectedPrefixes.some(
          (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`),
        );

        if (
          error?.response?.status === 401 &&
          isProtectedPath &&
          !isHandling401.current
        ) {
          isHandling401.current = true;

          const redirectPath = `${currentPath}${window.location.search}`;
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