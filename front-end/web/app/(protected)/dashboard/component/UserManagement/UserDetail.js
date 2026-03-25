import { useEffect, useMemo, useState } from "react";
import { usersAPI } from "../../../../../lib/api";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

export function UserDetail({ userId, isOpen, onClose }) {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !isOpen) return;

    setLoading(true);
    setError(null);
    setUser(null);

    usersAPI
      .getUserById(userId)
      .then((data) => {
        const detail = data?.data || data;
        setUser(detail);
      })
      .catch((err) => {
        console.error("Error fetching user detail:", err);
        setError(
          t("error_fetching_user_detail") || "Error fetching user detail",
        );
      })
      .finally(() => setLoading(false));
  }, [userId, isOpen, t]);

  const fullName = user?.full_name || user?.name || "No Name";
  const role = user?.role ? t(user.role) || user.role : "";
  const email = user?.email || "";
  const phone = user?.phone || "";
  const location = user?.location || user?.address || "";
  const avatar = user?.avatar || "";
  const createdDate =
    user?.created_at || user?.createdAt
      ? new Date(user.created_at || user.createdAt).toLocaleDateString("vi-VN")
      : "";

  const statusText = user?.is_banned
    ? t("blocked") || "Blocked"
    : t("active") || "Active";

  const statusClass = user?.is_banned
    ? "bg-red-100 text-red-700 border border-red-200"
    : "bg-green-100 text-green-700 border border-green-200";

  const profileFields = useMemo(() => {
    if (!user) return [];

    const items = [
      {
        key: "email",
        label: t("email") || "Email",
        value: email,
      },
      {
        key: "phone",
        label: t("phone") || "Phone",
        value: phone,
      },
      {
        key: "role",
        label: t("role") || "Role",
        value: role,
      },
      {
        key: "status",
        label: t("status") || "Status",
        value: statusText,
        badge: true,
        badgeClass: statusClass,
      },
      {
        key: "location",
        label: t("location") || "Location",
        value: location,
      },
      {
        key: "joinDate",
        label: t("join_date") || "Join Date",
        value: createdDate,
      },
    ];

    return items.filter((item) => {
      if (item.key === "status") return true;
      return item.value && String(item.value).trim() !== "";
    });
  }, [
    user,
    t,
    email,
    phone,
    role,
    statusText,
    statusClass,
    location,
    createdDate,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 py-6">
      <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-100">
        <button
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm backdrop-blur hover:bg-white"
          onClick={onClose}
        >
          <span className="text-xl leading-none">&times;</span>
        </button>

        {loading ? (
          <div className="p-8">
            <div className="h-36 rounded-[20px] bg-linear-to-r from-sky-100 via-fuchsia-100 to-rose-100 animate-pulse" />
            <div className="-mt-10 px-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 border-4 border-white animate-pulse" />
              <div className="mt-4 h-6 w-40 rounded bg-gray-200 animate-pulse" />
              <div className="mt-3 h-4 w-28 rounded bg-gray-100 animate-pulse" />
              <div className="mt-6 space-y-3">
                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center text-red-600">
              {error}
            </div>
          </div>
        ) : user ? (
          <>
            <div className="h-36 w-full bg-linear-to-r from-sky-200 via-fuchsia-200 to-rose-300" />

            <div className="relative px-5 pb-5">
              <div className="-mt-12 flex items-end gap-4">
                <div className="shrink-0 rounded-full border-4 border-white bg-white shadow-md">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={fullName}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-[#1a4d2e] to-[#2d7a4f] text-3xl font-bold text-white">
                      {fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-[28px] leading-tight font-bold text-gray-900 wrap-break-word">
                  {fullName}
                </h2>

                {role ? (
                  <p className="mt-1 text-sm font-medium text-[#6b6ee8] wrap-break-word">
                    {role}
                  </p>
                ) : null}
              </div>

              {profileFields.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {profileFields.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {item.label}
                      </div>

                      <div className="mt-1">
                        {item.badge ? (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${item.badgeClass}`}
                          >
                            {item.value}
                          </span>
                        ) : (
                          <div className="text-[15px] font-medium text-gray-800 wrap-break-word">
                            {item.value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-[#1a4d2e] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#143c24]"
                >
                  {t("close") || "Close"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
              {t("no_user_data") || "No user data."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
