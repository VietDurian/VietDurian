import { laborCostsService } from '@/services/laborCostsService';

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

const viewLaborCostsList = async (req, res, next) => {
	try {
		const { page, limit, season_diary_id, seasonDiaryId } = req.query;
		const userId = req.user?.id || req.user?._id;

		const result = await laborCostsService.viewLaborCostsList({
			page,
			limit,
			seasonDiaryId: season_diary_id || seasonDiaryId,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Danh sách nhật kí chi phí thuê lao động retrieved successfully',
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error) {
		next(error);
	}
};

const createLaborCosts = async (req, res, next) => {
	try {
		const userId = req.user?.id || req.user?._id;
		const payload = extractSeasonDiaryPayload(req.body);

		const created = await laborCostsService.createLaborCosts({
			userId,
			role: req.user?.role,
			data: payload,
		});

		res.status(201).json({
			code: 201,
			message: 'Tạo nhật kí chi phí thuê lao động thành công',
			data: created,
		});
	} catch (error) {
		next(error);
	}
};

const updateLaborCosts = async (req, res, next) => {
	try {
		const { labor_cost_id } = req.params;
		const userId = req.user?.id || req.user?._id;
		const payload = extractSeasonDiaryPayload(req.body);

		if (!Object.keys(payload || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		const updated = await laborCostsService.updateLaborCosts({
			laborCostId: labor_cost_id,
			userId,
			role: req.user?.role,
			data: payload,
		});

		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật kí chi phí thuê lao động thành công',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

const deleteLaborCosts = async (req, res, next) => {
	try {
		const { labor_cost_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		await laborCostsService.deleteLaborCosts({
			laborCostId: labor_cost_id,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Xóa nhật kí chi phí thuê lao động thành công',
		});
	} catch (error) {
		next(error);
	}
};

export const laborCostsController = {
	viewLaborCostsList,
	createLaborCosts,
	updateLaborCosts,
	deleteLaborCosts,
};
