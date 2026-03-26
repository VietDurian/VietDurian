import { HarvestConsumptionModel } from '@/model/harvestConsumptionModel';
import { SeasonDiaryModel } from '@/model/seasonDiaryModel';
import createError from 'http-errors';

const parsePage = (page) => {
	const parsed = Number.parseInt(page, 10);
	return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
};

const parseLimit = (limit) => {
	const parsed = Number.parseInt(limit, 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return 10;
	}
	return parsed > 100 ? 100 : parsed;
};

const normalizeDate = (value, fieldName) => {
	if (value === undefined || value === null) {
		return value;
	}

	if (value === '') {
		return null;
	}

	const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (dateOnlyRegex.test(value)) {
		const parsedDate = new Date(`${value}T00:00:00.000Z`);
		if (Number.isNaN(parsedDate.getTime())) {
			throw createError(400, `${fieldName} must be a valid date in YYYY-MM-DD format`);
		}
		return parsedDate;
	}

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		throw createError(400, `${fieldName} must be a valid date in YYYY-MM-DD format`);
	}

	return parsedDate;
};

const normalizeNumber = (value, fieldName) => {
	if (value === undefined || value === null || value === '') {
		return value === '' ? null : value;
	}

	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw createError(400, `${fieldName} must be a number`);
	}

	return value;
};

const sanitizePayload = (payload) => {
	const sanitized = { ...payload };

	if (Object.prototype.hasOwnProperty.call(sanitized, 'harvest_date')) {
		sanitized.harvest_date = normalizeDate(sanitized.harvest_date, 'harvest_date');
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'sale_date')) {
		sanitized.sale_date = normalizeDate(sanitized.sale_date, 'sale_date');
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'harvest_quantity_kg')) {
		sanitized.harvest_quantity_kg = normalizeNumber(
			sanitized.harvest_quantity_kg,
			'harvest_quantity_kg',
		);
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'consumed_weight_kg')) {
		sanitized.consumed_weight_kg = normalizeNumber(
			sanitized.consumed_weight_kg,
			'consumed_weight_kg',
		);
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'sale_unit_price_vnd')) {
		sanitized.sale_unit_price_vnd = normalizeNumber(
			sanitized.sale_unit_price_vnd,
			'sale_unit_price_vnd',
		);
	}

	// Explicitly remove columns user requested to exclude.
	delete sanitized.processing_location;
	delete sanitized.processing_method;
	delete sanitized.location;
	delete sanitized.sale_total_amount_vnd;

	return sanitized;
};

const validateRequiredHarvestFieldsOnCreate = (payload) => {
	if (!payload?.harvest_date) {
		throw createError(400, 'Ngày thu hoạch không được để trống');
	}

	if (
		payload?.harvest_quantity_kg === undefined ||
		payload?.harvest_quantity_kg === null
	) {
		throw createError(400, 'Số lượng thu hoạch không được để trống');
	}
};

const validateRequiredHarvestFieldsOnUpdate = (payload) => {
	if (
		Object.prototype.hasOwnProperty.call(payload, 'harvest_date') &&
		(payload.harvest_date === null || payload.harvest_date === undefined)
	) {
		throw createError(400, 'Ngày thu hoạch không được để trống');
	}

	if (
		Object.prototype.hasOwnProperty.call(payload, 'harvest_quantity_kg') &&
		(payload.harvest_quantity_kg === null || payload.harvest_quantity_kg === undefined)
	) {
		throw createError(400, 'Số lượng thu hoạch không được để trống');
	}
};

const ensureSeasonDiaryExists = async ({ seasonDiaryId }) => {
	if (!seasonDiaryId) {
		return;
	}

	const diary = await SeasonDiaryModel.findById(seasonDiaryId).select('_id').lean();
	if (!diary) {
		throw createError(404, 'Season diary not found');
	}
};

const viewHarvestConsumptionList = async ({ page, limit, seasonDiaryId, userId }) => {
	const pageNumber = parsePage(page);
	const limitNumber = parseLimit(limit);
	const skip = (pageNumber - 1) * limitNumber;
	const query = { season_diary_id: { $ne: null } };

	if (seasonDiaryId) {
		await ensureSeasonDiaryExists({ seasonDiaryId });
		query.season_diary_id = seasonDiaryId;
	}

	const [items, total] = await Promise.all([
		HarvestConsumptionModel.find(query)
			.select('-created_by -__v')
			.populate({
				path: 'season_diary_id',
				select: 'garden_name status user_id',
			})
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(limitNumber)
			.lean(),
		HarvestConsumptionModel.countDocuments(query),
	]);

	return {
		data: items,
		pagination: {
			totalItems: total,
			totalPages: Math.ceil(total / limitNumber),
			currentPage: pageNumber,
			itemsPerPage: limitNumber,
		},
	};
};

const createHarvestConsumption = async ({ userId, data }) => {
	if (!data?.season_diary_id) {
		throw createError(400, 'season_diary_id is required');
	}

	await ensureSeasonDiaryExists({ seasonDiaryId: data.season_diary_id });

	const payload = {
		...sanitizePayload(data),
		created_by: userId,
	};

	validateRequiredHarvestFieldsOnCreate(payload);

	const created = await HarvestConsumptionModel.create(payload);
	return created;
};

const updateHarvestConsumption = async ({ harvestConsumptionId, userId, data }) => {
	const existing = await HarvestConsumptionModel.findById(harvestConsumptionId);
	if (!existing) {
		throw createError(404, 'Harvest/consumption log not found');
	}

	const targetSeasonDiaryId = data?.season_diary_id || existing.season_diary_id;
	await ensureSeasonDiaryExists({ seasonDiaryId: targetSeasonDiaryId });

	const payload = sanitizePayload(data);
	validateRequiredHarvestFieldsOnUpdate(payload);
	delete payload.created_by;

	Object.assign(existing, payload);
	const updated = await existing.save();
	return updated;
};

const deleteHarvestConsumption = async ({ harvestConsumptionId, userId }) => {
	const existing = await HarvestConsumptionModel.findById(harvestConsumptionId)
		.select('_id created_by')
		.lean();

	if (!existing) {
		throw createError(404, 'Harvest/consumption log not found');
	}

	await HarvestConsumptionModel.findByIdAndDelete(harvestConsumptionId);
	return true;
};

export const harvestConsumptionService = {
	viewHarvestConsumptionList,
	createHarvestConsumption,
	updateHarvestConsumption,
	deleteHarvestConsumption,
};
