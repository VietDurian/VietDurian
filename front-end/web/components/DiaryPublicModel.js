'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useDiaryStore } from '@/store/useDiaryStore';

const formatDate = (dateString) => {
	if (!dateString) return 'Chưa cập nhật';
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
	return date.toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

const formatNumber = (value) => {
	const number = Number(value || 0);
	return new Intl.NumberFormat('vi-VN').format(number);
};

const toVietnameseStatus = (status) => {
	if (status === 'Completed') return 'Hoàn thành';
	if (status === 'In progressing') return 'Đang thực hiện';
	return status || 'Chưa cập nhật';
};

export default function DiaryPublicModel({ diaryId }) {
	const { diaryDetail, isDiaryDetailsLoading, getDiaryDetails } =
		useDiaryStore();

	useEffect(() => {
		if (!diaryId) return;
		getDiaryDetails(diaryId);
	}, [diaryId, getDiaryDetails]);

	if (!diaryId) {
		return <p className="text-gray-500">Sản phẩm chưa liên kết nhật ký.</p>;
	}

	if (isDiaryDetailsLoading) {
		return <p className="text-gray-500">Đang tải nhật ký...</p>;
	}

	if (!diaryDetail?._id) {
		return <p className="text-gray-500">Không tìm thấy dữ liệu nhật ký.</p>;
	}

	const endSeasonDate =
		diaryDetail.end_date ||
		(diaryDetail.status === 'Completed' ? diaryDetail.updated_at : null);
	const statusVi = toVietnameseStatus(diaryDetail.status);
	const statusBadgeClass =
		diaryDetail.status === 'Completed'
			? 'bg-green-100 text-green-700'
			: 'bg-yellow-100 text-yellow-700';

	return (
		<div className="space-y-6 rounded-2xl bg-gray-50 p-4 md:p-6">
			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
					<h3 className="text-lg font-bold text-gray-900">
						{diaryDetail.title}
					</h3>
					<span
						className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass}`}
					>
						{statusVi}
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
					<div className="flex justify-between border-b border-gray-100 py-2 gap-3">
						<span className="font-semibold text-gray-600">Vườn</span>
						<span className="text-gray-900 text-right">
							{diaryDetail?.garden_id?.name || 'Chưa cập nhật'}
						</span>
					</div>
					<div className="flex justify-between border-b border-gray-100 py-2 gap-3">
						<span className="font-semibold text-gray-600">Giống cây</span>
						<span className="text-gray-900 text-right">
							{diaryDetail.crop_type || 'Chưa cập nhật'}
						</span>
					</div>
					<div className="flex justify-between border-b border-gray-100 py-2 gap-3">
						<span className="font-semibold text-gray-600">Bắt đầu mùa vụ</span>
						<span className="text-gray-900 text-right">
							{formatDate(diaryDetail.start_date)}
						</span>
					</div>
					<div className="flex justify-between border-b border-gray-100 py-2 gap-3">
						<span className="font-semibold text-gray-600">Kết thúc mùa vụ</span>
						<span className="text-gray-900 text-right">
							{formatDate(endSeasonDate)}
						</span>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
				<p className="font-semibold text-gray-700 mb-2">Mô tả nhật ký</p>
				<p className="text-gray-700 leading-relaxed rounded-lg border border-gray-100 bg-gray-50 p-4">
					{diaryDetail.description || 'Chưa có mô tả'}
				</p>
			</div>

			<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
				<p className="font-semibold text-gray-700 mb-3">
					Các giai đoạn ({diaryDetail.stages?.length || 0})
				</p>
				<div className="space-y-3">
					{(diaryDetail.stages || []).map((stage) => (
						<div
							key={String(stage.stage_id || stage.stage_title)}
							className="rounded-lg border border-gray-200 bg-white p-4"
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="font-semibold text-gray-900">
										Giai đoạn {stage.order_index}: {stage.stage_title}
									</p>
									<p className="text-sm text-gray-600 mt-1">
										{stage.stage_description || 'Không có mô tả'}
									</p>
								</div>
								<span className="text-sm text-gray-500 whitespace-nowrap">
									{stage.steps?.length || 0} bước
								</span>
							</div>

							{stage.steps?.length > 0 && (
								<ul className="mt-3 space-y-2">
									{stage.steps.map((step) => (
										<li
											key={step._id}
											className="rounded-lg border border-gray-200 bg-gray-50 p-3"
										>
											<div className="flex items-center justify-between gap-3">
												<span className="font-semibold text-gray-900">
													{step.step_name}
												</span>
												<span className="text-emerald-700 whitespace-nowrap text-sm font-semibold">
													{formatNumber(step.cost)} đ
												</span>
											</div>

											{step.image ? (
												<div className="mt-2 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 items-start">
													<Image
														src={step.image}
														alt={step.step_name || 'Ảnh bước nhật ký'}
														width={420}
														height={280}
														unoptimized
														className="w-full max-w-xs h-auto rounded-lg border border-gray-200"
														// Đổi h-36 thành h-auto
													/>
													<div>
														{step.description && (
															<p className="text-sm text-gray-600">
																{step.description}
															</p>
														)}
														<p className="mt-1 text-xs text-gray-500">
															Ngày thực hiện: {formatDate(step.action_date)}
														</p>
													</div>
												</div>
											) : (
												<div className="mt-2">
													{step.description && (
														<p className="text-sm text-gray-600">
															{step.description}
														</p>
													)}
													<p className="mt-1 text-xs text-gray-500">
														Ngày thực hiện: {formatDate(step.action_date)}
													</p>
												</div>
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
