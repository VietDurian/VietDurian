"use client";
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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true = chưa đọc xong localStorage
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

    setUser(null);
    setToken(null);
    useAuthStore.setState({ authUser: null });
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

  // FIX: Đọc localStorage và gọi checkAuth đúng thứ tự
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");

    if (storedToken && storedUser) {
      // FIX: Chỉ restore session khi CẢ HAI đều có
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        useAuthStore.setState({ authUser: parsedUser });
      } catch (error) {
        console.error("Failed to parse auth_user", error);
        clearClientAuthState();
      }
    } else {
      // FIX: Thiếu 1 trong 2 → clear hết, không để trạng thái nửa vời
      clearClientAuthState();
    }

    setLoading(false);

    // FIX: Gọi checkAuth để verify token với server (background)
    // Nếu token expired server sẽ trả 401, interceptor sẽ handle logout
    useAuthStore.getState().checkAuth();
  }, [clearClientAuthState]);

  const login = useCallback((userData, authToken) => {
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", authToken);

    setUser(userData);
    setToken(authToken);
    useAuthStore.setState({ authUser: userData });
  }, []);

  const loginWithGoogle = useCallback(
    async (credential) => {
      try {
        const res = await apiClient.post("/auth/google-login", {
          token: credential,
        });

        const responseData = res?.data?.data ?? {};
        let user = responseData.user;
        const token = responseData.token;

        if (!user || !token) {
          throw new Error("Invalid Google login response");
        }

        localStorage.setItem("auth_user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);

        if (!user?.role) {
          const latestUser = await refreshProfile();
          if (latestUser) user = latestUser;
        }

        setUser(user);
        setToken(token);
        useAuthStore.setState({ authUser: user });

        const roleRoutes = {
          admin: "/dashboard",
          farmer: "/profile/details",
          trader: "/profile/details",
          serviceProvider: "/profile/details",
          contentExpert: "/profile/details",
        };

        router.replace(roleRoutes[user?.role] || "/");
        return res.data;
      } catch (error) {
        console.error("Google login error:", error);
        throw error;
      }
    },
    [refreshProfile, router],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);

    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      clearClientAuthState();
      isHandling401.current = false;
      useAuthStore.getState().disconnectWS();
    }
  }, [clearClientAuthState]);

  // Bắt 401 toàn cục
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const currentPath = window.location.pathname;
        const protectedPrefixes = ["/dashboard", "/profile", "/chat", "/home"];
        const isProtectedPath = protectedPrefixes.some(
          (prefix) =>
            currentPath === prefix || currentPath.startsWith(`${prefix}/`),
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
        loginWithGoogle,
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
