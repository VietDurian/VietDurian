import { harvestConsumptionService } from '@/services/harvestConsumptionService';

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

const viewHarvestConsumptionList = async (req, res, next) => {
	try {
		const { page, limit, season_diary_id, seasonDiaryId } = req.query;
		const userId = req.user?.id || req.user?._id;

		const result = await harvestConsumptionService.viewHarvestConsumptionList({
			page,
			limit,
			seasonDiaryId: season_diary_id || seasonDiaryId,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Danh sách nhật kí thu hoạch và tiêu thụ sản phẩm retrieved successfully',
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error) {
		next(error);
	}
};

const createHarvestConsumption = async (req, res, next) => {
	try {
		const userId = req.user?.id || req.user?._id;
		const payload = extractSeasonDiaryPayload(req.body);

		const created = await harvestConsumptionService.createHarvestConsumption({
			userId,
			role: req.user?.role,
			data: payload,
		});

		res.status(201).json({
			code: 201,
			message: 'Tạo nhật kí thu hoạch và tiêu thụ sản phẩm thành công',
			data: created,
		});
	} catch (error) {
		next(error);
	}
};

const updateHarvestConsumption = async (req, res, next) => {
	try {
		const { harvest_consumption_id } = req.params;
		const userId = req.user?.id || req.user?._id;
		const payload = extractSeasonDiaryPayload(req.body);

		if (!Object.keys(payload || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		const updated = await harvestConsumptionService.updateHarvestConsumption({
			harvestConsumptionId: harvest_consumption_id,
			userId,
			role: req.user?.role,
			data: payload,
		});

		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật kí thu hoạch và tiêu thụ sản phẩm thành công',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

const deleteHarvestConsumption = async (req, res, next) => {
	try {
		const { harvest_consumption_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		await harvestConsumptionService.deleteHarvestConsumption({
			harvestConsumptionId: harvest_consumption_id,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Xóa nhật kí thu hoạch và tiêu thụ sản phẩm thành công',
		});
	} catch (error) {
		next(error);
	}
};

export const harvestConsumptionController = {
	viewHarvestConsumptionList,
	createHarvestConsumption,
	updateHarvestConsumption,
	deleteHarvestConsumption,
};
