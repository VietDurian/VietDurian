"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { notificationAPI } from "@/lib/api";

const DeleteNotificationModal = ({ isOpen, onClose, onConfirm, deleting }) => {
	useEffect(() => {
		if (!isOpen) return;

		const handleEsc = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [isOpen, onClose]);

	if (!isOpen) return null;
	if (typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 z-[120] grid place-items-center p-4">
			<div className="absolute inset-0 bg-black/45" onClick={onClose} />
			<div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
				<h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa?</h3>
				<p className="mt-2 text-sm text-gray-600">
					Thông báo này sẽ không thể khôi phục.
				</p>
				<div className="mt-6 flex gap-3">
					<button
						type="button"
						onClick={onClose}
						disabled={deleting}
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Hủy
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={deleting}
						className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{deleting ? "Dang xoa..." : "Xóa"}
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default function NotificationPost({ user }) {
	const pathname = usePathname();
	const router = useRouter();
	const wrapperRef = useRef(null);

	const [notificationOpen, setNotificationOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const [pendingDelete, setPendingDelete] = useState(null);
	const [deleting, setDeleting] = useState(false);

	const calculateRelativeTime = (createdAt) => {
		const now = new Date();
		const past = new Date(createdAt);
		const diffMs = now - past;
		const diffSecs = Math.floor(diffMs / 1000);
		const diffMins = Math.floor(diffSecs / 60);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffSecs < 60) return "vua xong";
		if (diffMins < 60) return `${diffMins} phut truoc`;
		if (diffHours < 24) return `${diffHours} gio truoc`;
		if (diffDays < 7) return `${diffDays} ngay truoc`;
		return new Date(createdAt).toLocaleDateString("vi-VN");
	};

	useEffect(() => {
		const fetchNotifications = async () => {
			if (!user) return;

			try {
				setLoading(true);
				const response = await notificationAPI.getNotifications();
				const data = response.data || [];

				const mappedNotifications = data.map((notif) => ({
					id: notif._id,
					postId: notif.post_id?._id,
					message: notif.message,
					time: calculateRelativeTime(notif.created_at),
					read: notif.is_read,
					sender: notif.sender_id,
					entityType: notif.entity_type,
				}));

				setNotifications(mappedNotifications);
			} catch (error) {
				console.error("Error fetching notifications:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchNotifications();

		const interval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(interval);
	}, [user]);

	useEffect(() => {
		setNotificationOpen(false);
		setPendingDelete(null);
	}, [pathname]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setNotificationOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!user) return null;

	const unreadCount = notifications.filter((notification) => !notification.read).length;

	const handleNotificationClick = async (notif) => {
		if (!notif.read) {
			try {
				await notificationAPI.markAsRead(notif.id);
				setNotifications((prev) =>
					prev.map((item) =>
						item.id === notif.id ? { ...item, read: true } : item,
					),
				);
			} catch (error) {
				console.error("Error marking notification as read:", error);
			}
		}

		if (notif.entityType === "comment" || notif.entityType === "reply") {
			if (notif.postId) {
				router.push(`/posts?postId=${notif.postId}`);
			} else {
				router.push("/posts");
			}
		} else if (
			notif.entityType === "Accepted Post" ||
			notif.entityType === "Rejected Post"
		) {
			router.push("/profile/posts");
		}

		setNotificationOpen(false);
	};

	const handleConfirmDelete = async () => {
		if (!pendingDelete) return;

		try {
			setDeleting(true);
			await notificationAPI.deleteNotification(pendingDelete.id);
			setNotifications((prev) => prev.filter((item) => item.id !== pendingDelete.id));
			setPendingDelete(null);
		} catch (error) {
			console.error("Error deleting notification:", error);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="relative" ref={wrapperRef}>
			<button
				onClick={() => setNotificationOpen((prev) => !prev)}
				className="relative flex items-center justify-center transition hover:text-emerald-600"
			>
				<Bell className="h-5 w-5 text-gray-600 hover:text-emerald-600" />
				{unreadCount > 0 && (
					<span className="absolute right-0 top-0 inline-flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-white">
						{unreadCount}
					</span>
				)}
			</button>

			{notificationOpen && (
				<div className="absolute right-0 mt-5 w-80 rounded-xl border border-gray-300 bg-white shadow-lg">
					<div className="flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-white p-3">
						<h3 className="font-semibold text-gray-800">Thong bao</h3>
						<span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
							{unreadCount}
						</span>
					</div>

					<div className="max-h-80 overflow-y-auto rounded-b-xl">
						{loading ? (
							<div className="p-8 text-center text-gray-500">
								<p>Dang tai...</p>
							</div>
						) : notifications.length > 0 ? (
							<div className="divide-y divide-gray-100">
								{notifications.map((notif) => (
									<div
										key={notif.id}
										onClick={() => handleNotificationClick(notif)}
										className={`group flex cursor-pointer items-start gap-3 p-4 transition hover:bg-gray-50 ${
											!notif.read ? "bg-emerald-50" : ""
										}`}
									>
										{notif.sender?.avatar ? (
											<div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
												<Image
													src={notif.sender.avatar}
													alt="Avatar"
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="h-8 w-8 flex-shrink-0" />
										)}

										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<p
													className={`text-sm ${
														!notif.read
															? "font-semibold text-gray-800"
															: "text-gray-700"
													}`}
												>
													{notif.message}
												</p>
												{!notif.read && (
													<div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-600" />
												)}
											</div>
											<p className="mt-1 text-xs text-gray-500">{notif.time}</p>
										</div>

										<button
											onClick={(event) => {
												event.stopPropagation();
												setPendingDelete(notif);
											}}
											className="flex-shrink-0 text-gray-400 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						) : (
							<div className="p-8 text-center text-gray-500">
								<p>Khong co thong bao</p>
							</div>
						)}
					</div>
				</div>
			)}

			<DeleteNotificationModal
				isOpen={Boolean(pendingDelete)}
				onClose={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
				deleting={deleting}
			/>
		</div>
	);
}
