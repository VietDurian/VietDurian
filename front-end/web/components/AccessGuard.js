"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAccessRule } from "@/lib/accessControl";

const NoAccess = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">
        Bạn không có quyền truy cập trang này
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Vui lòng kiểm tra lại quyền của tài khoản hoặc liên hệ quản trị viên.
      </p>
    </div>
  </div>
);

export default function AccessGuard({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const rule = useMemo(() => getAccessRule(pathname), [pathname]);
  const requiresRole = rule?.roles?.length;
  const isRoleAllowed = !requiresRole || rule.roles.includes(user?.role);

  useEffect(() => {
    if (!requireAuth || loading) return;
    if (user) return;

    const query = typeof window !== "undefined" ? window.location.search : "";
    const redirectPath = query ? `${pathname}?${query}` : pathname;
    const loginUrl = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";

    router.replace(loginUrl);
  }, [requireAuth, loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-600">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!isRoleAllowed) {
    return <NoAccess />;
  }

  return children;
}
