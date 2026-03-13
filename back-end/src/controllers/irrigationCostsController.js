import { irrigationCostsService } from '@/services/irrigationCostsService';

const irrigationMethodDropdown = [
	{ value: 'nho_giot', label: 'Nhỏ giọt' },
	{ value: 'phun_mua', label: 'Phun mưa' },
	{ value: 'thu_cong', label: 'Thủ công' },
];

const extractSeasonDiaryPayload = (body) => {
	const payload = { ...(body || {}) };

	if (payload.seasonDiary && typeof payload.seasonDiary === 'object') {
		Object.assign(payload, payload.seasonDiary);
		delete payload.seasonDiary;
	}

	if (payload.seasonDiaryId && !payload.season_diary_id) {
		payload.season_diary_id = payload.seasonDiaryId;
	}

	return payload;
};

const viewIrrigationCostsList = async (req, res, next) => {
	try {
		const { page, limit, season_diary_id, seasonDiaryId } = req.query;
		const seasonDiaryIdFromPath = req.params?.season_diary_id;
		const userId = req.user?.id || req.user?._id;

		const result = await irrigationCostsService.viewIrrigationCostsList({
			page,
			limit,
			seasonDiaryId: seasonDiaryIdFromPath || season_diary_id || seasonDiaryId,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Danh sách nhật kí chi phí tưới tiêu và hệ thống tưới retrieved successfully',
			data: result.data,
			pagination: result.pagination,
			dropdown: {
				irrigation_method: irrigationMethodDropdown,
			},
		});
	} catch (error) {
		next(error);
	}
};

const createIrrigationCosts = async (req, res, next) => {
	try {
		const userId = req.user?.id || req.user?._id;
		const seasonDiaryIdFromPath = req.params?.season_diary_id;
		const payload = extractSeasonDiaryPayload(req.body);

		if (seasonDiaryIdFromPath) {
			payload.season_diary_id = seasonDiaryIdFromPath;
		}

		const created = await irrigationCostsService.createIrrigationCosts({
			userId,
			role: req.user?.role,
			data: payload,
		});

		res.status(201).json({
			code: 201,
			message: 'Tạo nhật kí chi phí tưới tiêu và hệ thống tưới thành công',
			data: created,
			dropdown: {
				irrigation_method: irrigationMethodDropdown,
			},
		});
	} catch (error) {
		next(error);
	}
};

const updateIrrigationCosts = async (req, res, next) => {
	try {
		const { irrigation_cost_id } = req.params;
		const userId = req.user?.id || req.user?._id;
		const seasonDiaryIdFromPath = req.params?.season_diary_id;
		const payload = extractSeasonDiaryPayload(req.body);

		if (!Object.keys(payload || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		if (seasonDiaryIdFromPath) {
			payload.season_diary_id = seasonDiaryIdFromPath;
		}

		const updated = await irrigationCostsService.updateIrrigationCosts({
			irrigationCostId: irrigation_cost_id,
			userId,
			role: req.user?.role,
			data: payload,
		});

		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật kí chi phí tưới tiêu và hệ thống tưới thành công',
			data: updated,
			dropdown: {
				irrigation_method: irrigationMethodDropdown,
			},
		});
	} catch (error) {
		next(error);
	}
};

const deleteIrrigationCosts = async (req, res, next) => {
	try {
		const { irrigation_cost_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		await irrigationCostsService.deleteIrrigationCosts({
			irrigationCostId: irrigation_cost_id,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Xóa nhật kí chi phí tưới tiêu và hệ thống tưới thành công',
		});
	} catch (error) {
		next(error);
	}
};

export const irrigationCostsController = {
	viewIrrigationCostsList,
	createIrrigationCosts,
	updateIrrigationCosts,
	deleteIrrigationCosts,
};
