'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Upload, KeyRound, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
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

// Phone validation — giống hệt ProfileDetails
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

// PasswordRule component — giống ProfileDetails
const PasswordRule = ({ rule, password }) => {
	const isValid = rule.test(password);
	return (
		<div className="flex items-center gap-2">
			{isValid
				? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
				: <XCircle size={16} className="text-gray-300 flex-shrink-0" strokeWidth={2.5} />}
			<span className={`text-sm ${isValid ? 'text-[#1a4d2e]' : 'text-gray-500'}`}>{rule.label}</span>
		</div>
	);
};

export function AdminProfilePage() {
	const { user, loading, refreshProfile, setUserUnsafe } = useAuth();
	const { language, t } = useLanguage();

	const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
	const [avatarPreview, setAvatarPreview] = useState('');
	const [savingProfile, setSavingProfile] = useState(false);
	const [phoneError, setPhoneError] = useState('');

	const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
	const [changingPw, setChangingPw] = useState(false);
	const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

	// Password rules — giống ProfileDetails
	const passwordRules = [
		{ id: 'length', test: (pwd) => pwd.length >= 12, label: t('profile_pw_rule1') },
		{ id: 'uppercase', test: (pwd) => /[A-Z]/.test(pwd), label: t('profile_pw_rule2') },
		{ id: 'lowercase', test: (pwd) => /[a-z]/.test(pwd), label: t('profile_pw_rule3') },
		{ id: 'number', test: (pwd) => /\d/.test(pwd), label: t('profile_pw_rule4') },
		{ id: 'special', test: (pwd) => /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/.test(pwd), label: t('profile_pw_rule5') },
	];

	// Derived password state — giống ProfileDetails
	const allRulesPassed = passwordRules.every((rule) => rule.test(pwForm.newPassword));
	const passwordsMatch = pwForm.newPassword === pwForm.confirmPassword && pwForm.confirmPassword !== '';
	const passwordsDifferent = pwForm.newPassword !== pwForm.currentPassword;
	const canChangePassword =
		allRulesPassed &&
		passwordsMatch &&
		pwForm.currentPassword !== '' &&
		passwordsDifferent;

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

	// Phone onChange — validate realtime giống ProfileDetails
	const onPhoneChange = (e) => {
		const value = e.target.value.replace(/\D/g, '');
		setProfileForm((s) => ({ ...s, phone: value }));
		if (!value.trim()) {
			setPhoneError(t('phone_error_required'));
		} else if (!phoneRegex.test(value)) {
			setPhoneError(t('phone_error_invalid'));
		} else {
			setPhoneError('');
		}
	};

	const onSaveProfile = async () => {
		const fullNameEmpty = !String(profileForm.full_name || '').trim();

		// Re-validate phone khi submit
		if (!profileForm.phone.trim()) {
			setPhoneError(t('phone_error_required'));
		} else if (!phoneRegex.test(profileForm.phone)) {
			setPhoneError(t('phone_error_invalid'));
		} else {
			setPhoneError('');
		}

		if (fullNameEmpty) {
			toast.error(t('err_full_name_required'));
			return;
		}
		if (!profileForm.phone.trim()) {
			toast.error(t('phone_error_required'));
			return;
		}
		if (!phoneRegex.test(profileForm.phone)) {
			toast.error(t('phone_error_invalid'));
			return;
		}

		setSavingProfile(true);
		try {
			const payload = {
				full_name: profileForm.full_name,
				phone: profileForm.phone,
			};
			if (avatarPreview && avatarPreview.startsWith('data:image/')) {
				payload.avatar = avatarPreview;
			}
			const res = await profileAPI.update(payload);
			const updated = res?.data ?? res;
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

	const togglePasswordVisibility = (field) =>
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

	const onChangePassword = async () => {
		if (!canChangePassword) return;
		setChangingPw(true);
		try {
			await authAPI.changePassword({
				currentPassword: pwForm.currentPassword,
				newPassword: pwForm.newPassword,
			});
			setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			toast.success(t('pw_changed'));
		} catch (err) {
			const { status, data } = err?.response || {};
			let errorMessage;
			if (status === 400) errorMessage = t('profile_pw_wrong_current');
			else if (status === 422) errorMessage = t('profile_pw_invalid_new');
			else if (status === 500) errorMessage = t('profile_pw_server_error');
			else errorMessage =
				(typeof data === 'string' && data) ||
				data?.message || data?.error || data?.msg ||
				t('pw_change_failed');
			toast.error(errorMessage);
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

						{/* Phone — có validation */}
						<div>
							<label className="text-sm text-gray-600">{t('phone')}</label>
							<input
								value={profileForm.phone}
								onChange={onPhoneChange}
								inputMode="numeric"
								pattern="[0-9]*"
								className={`mt-1 w-full rounded-xl border px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e] ${phoneError ? 'border-red-400' : 'border-gray-400'
									}`}
								placeholder={t('placeholder_phone')}
							/>
							{phoneError && (
								<p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
									<XCircle size={14} strokeWidth={2.5} />
									{phoneError}
								</p>
							)}
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
					{/* Current Password */}
					<div>
						<label className="text-sm text-gray-600">{t('current_password')}</label>
						<div className="relative mt-1">
							<input
								type={showPasswords.current ? 'text' : 'password'}
								value={pwForm.currentPassword}
								onChange={(e) => setPwForm((s) => ({ ...s, currentPassword: e.target.value }))}
								className="w-full rounded-xl border border-gray-400 px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility('current')}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none focus:ring-0"
							>
								{showPasswords.current ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
							</button>
						</div>
					</div>

					{/* New Password */}
					<div>
						<label className="text-sm text-gray-600">{t('new_password')}</label>
						<div className="relative mt-1">
							<input
								type={showPasswords.new ? 'text' : 'password'}
								value={pwForm.newPassword}
								onChange={(e) => setPwForm((s) => ({ ...s, newPassword: e.target.value }))}
								className="w-full rounded-xl border border-gray-400 px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility('new')}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none focus:ring-0"
							>
								{showPasswords.new ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
							</button>
						</div>
						{pwForm.newPassword && pwForm.currentPassword && !passwordsDifferent && (
							<div className="mt-2 flex items-center gap-2">
								<XCircle size={16} className="text-red-500" strokeWidth={2.5} />
								<span className="text-sm text-red-600">{t('profile_pw_same_as_current')}</span>
							</div>
						)}
					</div>

					{/* Confirm Password */}
					<div>
						<label className="text-sm text-gray-600">{t('confirm_password')}</label>
						<div className="relative mt-1">
							<input
								type={showPasswords.confirm ? 'text' : 'password'}
								value={pwForm.confirmPassword}
								onChange={(e) => setPwForm((s) => ({ ...s, confirmPassword: e.target.value }))}
								className="w-full rounded-xl border border-gray-400 px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]/25 focus:border-[#1a4d2e]"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility('confirm')}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none focus:ring-0"
							>
								{showPasswords.confirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
							</button>
						</div>
						{/* Match / not-match feedback */}
						{pwForm.confirmPassword && (
							<div className="mt-2 flex items-center gap-2">
								{passwordsMatch
									? <><CheckCircle size={16} className="text-emerald-500" strokeWidth={2.5} /><span className="text-sm text-emerald-600">{t('profile_pw_match')}</span></>
									: <><XCircle size={16} className="text-red-500" strokeWidth={2.5} /><span className="text-sm text-red-600">{t('profile_pw_not_match')}</span></>}
							</div>
						)}
					</div>
				</div>

				{/* Password rules — chỉ hiện khi đang nhập new password */}
				{pwForm.newPassword && (
					<div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 max-w-md">
						<p className="text-sm font-semibold text-gray-700 mb-2">{t('profile_pw_rules_title')}</p>
						{passwordRules.map((rule) => (
							<PasswordRule key={rule.id} rule={rule} password={pwForm.newPassword} />
						))}
					</div>
				)}

				<div className="mt-6 flex justify-end">
					<button
						type="button"
						onClick={onChangePassword}
						disabled={!canChangePassword || changingPw}
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${canChangePassword && !changingPw
							? 'bg-[#1a4d2e] text-white hover:bg-[#174427] cursor-pointer'
							: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}
					>
						<KeyRound className="w-4 h-4" />
						{changingPw ? t('changing') : t('change_password_btn')}
					</button>
				</div>
			</div>
		</div>
	);
}