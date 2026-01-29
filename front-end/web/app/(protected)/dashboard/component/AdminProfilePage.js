'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Upload, KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { authAPI, profileAPI } from '@/lib/api';
import { useLanguage } from '../context/LanguageContext';

const formatDate = (value, language) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const locale = language === 'en' ? 'en-US' : 'vi-VN';
	return date.toLocaleDateString(locale);
};

const formatRole = (role) => {
	if (!role) return '';
	const s = String(role);
	return s.charAt(0).toUpperCase() + s.slice(1);
};

const fileToDataUrl = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

const countDigits = (value) => String(value || '').replace(/\D/g, '').length;

const isStrongPassword = (value) =>
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$*])[A-Za-z\d@#$*]{12,}$/.test(String(value || ''));

export function AdminProfilePage() {
	const { user, loading, refreshProfile, setUserUnsafe } = useAuth();
	const { language, t } = useLanguage();

	const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
	const [avatarPreview, setAvatarPreview] = useState('');
	const [savingProfile, setSavingProfile] = useState(false);

	const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
	const [changingPw, setChangingPw] = useState(false);

	useEffect(() => {
		if (!user) return;
		setProfileForm({
			full_name: user.full_name || '',
			phone: user.phone || '',
		});
		setAvatarPreview(user.avatar || '');
	}, [user]);

	const createdAtLabel = useMemo(
		() => formatDate(user?.created_at, language),
		[user?.created_at, language],
	);
	const roleLabel = useMemo(() => formatRole(user?.role), [user?.role]);

	if (loading) {
		return (
			<div className="p-8">
				<div className="text-[#1a4d2e] font-semibold">{t('loading_profile')}</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-8">
				<div className="text-gray-700">{t('not_logged_in')}</div>
			</div>
		);
	}

	const onPickAvatar = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type?.startsWith('image/')) {
			toast.error(t('err_select_image'));
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error(t('err_image_too_large'));
			return;
		}

		try {
			const dataUrl = await fileToDataUrl(file);
			setAvatarPreview(String(dataUrl));
		} catch {
			toast.error(t('err_read_image'));
		}
	};

	const onSaveProfile = async () => {
		const fullNameEmpty = !String(profileForm.full_name || '').trim();
		const phoneDigits = countDigits(profileForm.phone);
		const phoneEmpty = phoneDigits === 0;

		if (fullNameEmpty && phoneEmpty) {
			toast.error(t('err_full_name_and_phone_required'));
			return;
		}
		if (fullNameEmpty) {
			toast.error(t('err_full_name_required'));
			return;
		}
		if (phoneEmpty) {
			toast.error(t('err_phone_required'));
			return;
		}
		if (phoneDigits < 10) {
			toast.error(t('err_phone_min10'));
			return;
		}

		setSavingProfile(true);
		try {
			const payload = {
				full_name: profileForm.full_name,
				phone: profileForm.phone,
			};

			// If user selected a new image, avatarPreview will be a data URL
			if (avatarPreview && avatarPreview.startsWith('data:image/')) {
				payload.avatar = avatarPreview;
			}

			const res = await profileAPI.update(payload);
			const updated = res?.data ?? res;
			// Update UI immediately, then refresh from server
			if (updated && typeof updated === 'object') {
				setUserUnsafe(updated);
			}
			await refreshProfile();
			toast.success(t('profile_updated'));
		} catch (err) {
			if (err?.response?.status === 413) {
				toast.error(t('err_payload_too_large'));
			} else {
				const data = err?.response?.data;
				const serverMessage =
					(typeof data === 'string' && data) ||
					data?.message ||
					data?.error ||
					data?.msg;
				toast.error(serverMessage || t('profile_update_failed'));
			}
		} finally {
			setSavingProfile(false);
		}
	};

	const onChangePassword = async () => {
		if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
			toast.error(t('pw_required'));
			return;
		}
		if (!isStrongPassword(pwForm.newPassword)) {
			toast.error(t('pw_policy'));
			return;
		}
		if (pwForm.newPassword !== pwForm.confirmPassword) {
			toast.error(t('pw_mismatch'));
			return;
		}

		setChangingPw(true);
		try {
			await authAPI.changePassword({
				currentPassword: pwForm.currentPassword,
				newPassword: pwForm.newPassword,
			});
			setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			toast.success(t('pw_changed'));
		} catch (err) {
			const data = err?.response?.data;
			const serverMessage =
				(typeof data === 'string' && data) ||
				data?.message ||
				data?.error ||
				data?.msg;
			toast.error(serverMessage || t('pw_change_failed'));
		} finally {
			setChangingPw(false);
		}
	};

	return (
		<div className="p-6 lg:p-8 space-y-6 overflow-auto">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#1a4d2e]">{t('profile_title')}</h1>
					<p className="text-gray-600 mt-1">{t('profile_subtitle')}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Left: avatar */}
				<div className="bg-white rounded-2xl border border-gray-200 p-6">
					<h2 className="font-semibold text-gray-900">{t('avatar_title')}</h2>
					<div className="mt-4 flex flex-col items-center">
						<div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
							{avatarPreview ? (
								<Image
									src={avatarPreview}
									alt={user.full_name || 'Avatar'}
									width={160}
									height={160}
									className="w-full h-full object-cover"
									unoptimized
								/>
							) : (
								<span className="text-gray-400">{t('no_image')}</span>
							)}
						</div>

						<label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a4d2e] text-white hover:bg-[#174427] cursor-pointer transition-colors">
							<Upload className="w-4 h-4" />
							<span>{t('upload_photo')}</span>
							<input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
						</label>
						<p className="mt-2 text-xs text-gray-500">{t('file_hint')}</p>
					</div>
				</div>

				{/* Right: info */}
				<div className="bg-white rounded-2xl border border-gray-200 p-6 xl:col-span-2">
					<h2 className="font-semibold text-gray-900">{t('account_info')}</h2>

					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="text-sm text-gray-600">{t('name')}</label>
							<input
								value={profileForm.full_name}
								onChange={(e) => setProfileForm((s) => ({ ...s, full_name: e.target.value }))}
								className="mt-1 w-full rounded-xl border border-gray-400 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
								placeholder={t('placeholder_full_name')}
							/>
						</div>

						<div>
							<label className="text-sm text-gray-600">{t('email')}</label>
							<input
								value={user.email || ''}
								disabled
								className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 text-gray-600"
							/>
						</div>

						<div>
							<label className="text-sm text-gray-600">{t('phone')}</label>
							<input
								value={profileForm.phone}
								onChange={(e) =>
									setProfileForm((s) => ({
										...s,
										phone: e.target.value.replace(/\D/g, ''),
									}))
								}
								inputMode="numeric"
								pattern="[0-9]*"
								className="mt-1 w-full rounded-xl border border-gray-400 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
								placeholder={t('placeholder_phone')}
							/>
						</div>

						<div>
							<label className="text-sm text-gray-600">{t('role')}</label>
							<input
								value={roleLabel}
								disabled
								className="mt-1 w-full rounded-xl border border-gray-400 px-3 py-2 bg-gray-100 text-gray-800"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="text-sm text-gray-600">{t('created_at')}</label>
							<input
								value={createdAtLabel}
								disabled
								className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 text-gray-600"
							/>
						</div>
					</div>

					<div className="mt-6 flex justify-end">
						<button
							type="button"
							onClick={onSaveProfile}
							disabled={savingProfile}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffd93d] text-[#1a4d2e] font-semibold hover:opacity-90 disabled:opacity-60"
						>
							<Save className="w-4 h-4" />
							{savingProfile ? t('saving') : t('save_changes')}
						</button>
					</div>
				</div>
			</div>

			{/* Change password */}
			<div className="bg-white rounded-2xl border border-gray-200 p-6">
				<div className="flex items-center gap-2">
					<KeyRound className="w-5 h-5 text-[#1a4d2e]" />
					<h2 className="font-semibold text-gray-900">{t('change_password')}</h2>
				</div>

				<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="text-sm text-gray-600">{t('current_password')}</label>
						<input
							type="password"
							value={pwForm.currentPassword}
							onChange={(e) => setPwForm((s) => ({ ...s, currentPassword: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-gray-400 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
							placeholder="••••••••"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600">{t('new_password')}</label>
						<input
							type="password"
							value={pwForm.newPassword}
							onChange={(e) => setPwForm((s) => ({ ...s, newPassword: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-gray-400 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
							placeholder="••••••••"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-600">{t('confirm_password')}</label>
						<input
							type="password"
							value={pwForm.confirmPassword}
							onChange={(e) => setPwForm((s) => ({ ...s, confirmPassword: e.target.value }))}
							className="mt-1 w-full rounded-xl border border-gray-400 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<div className="mt-6 flex justify-end">
					<button
						type="button"
						onClick={onChangePassword}
						disabled={changingPw}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a4d2e] text-white font-semibold hover:bg-[#174427] disabled:opacity-60"
					>
						<KeyRound className="w-4 h-4" />
						{changingPw ? t('changing') : t('change_password_btn')}
					</button>
				</div>
			</div>
		</div>
	);
}
