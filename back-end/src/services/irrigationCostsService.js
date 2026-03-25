import { IrrigationCostsModel } from '@/model/irrigationCostsModel';
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

const normalizeExecutionDate = (value) => {
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
			throw createError(400, 'execution_date must be a valid date in YYYY-MM-DD format');
		}
		return parsedDate;
	}

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		throw createError(400, 'execution_date must be a valid date in YYYY-MM-DD format');
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

const normalizeCostNumber = (value) => {
	return normalizeNumber(value, 'electricity_fuel_cost');
};

const normalizeDuration = (value) => {
	if (value === undefined || value === null || value === '') {
		return value === '' ? null : value;
	}

	if (typeof value !== 'object' || Array.isArray(value)) {
		throw createError(400, 'irrigation_duration must be an object with hours and minutes');
	}

	const normalized = {};

	if (Object.prototype.hasOwnProperty.call(value, 'hours')) {
		const hours = normalizeNumber(value.hours, 'irrigation_duration.hours');
		if (hours !== null && hours !== undefined && hours < 0) {
			throw createError(400, 'irrigation_duration.hours must be >= 0');
		}
		normalized.hours = hours;
	}

	if (Object.prototype.hasOwnProperty.call(value, 'minutes')) {
		const minutes = normalizeNumber(value.minutes, 'irrigation_duration.minutes');
		if (minutes !== null && minutes !== undefined) {
			if (minutes < 0 || minutes > 59) {
				throw createError(400, 'irrigation_duration.minutes must be between 0 and 59');
			}
		}
		normalized.minutes = minutes;
	}

	return normalized;
};

const sanitizeIrrigationPayload = (payload) => {
	const sanitized = { ...payload };

	delete sanitized.water_source;
	delete sanitized.maintenance_repair_cost;

	if (Object.prototype.hasOwnProperty.call(sanitized, 'irrigation_duration_hours')) {
		sanitized.irrigation_duration = {
			hours: normalizeNumber(
				sanitized.irrigation_duration_hours,
				'irrigation_duration_hours',
			),
			minutes: 0,
		};
		delete sanitized.irrigation_duration_hours;
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'irrigation_duration')) {
		sanitized.irrigation_duration = normalizeDuration(sanitized.irrigation_duration);
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'electricity_fuel_cost')) {
		sanitized.electricity_fuel_cost = normalizeCostNumber(
			sanitized.electricity_fuel_cost,
		);
	}

	return sanitized;
};

const ensureSeasonDiaryExists = async ({ seasonDiaryId }) => {
	if (!seasonDiaryId) {
		return;
	}

	const diary = await SeasonDiaryModel.findById(seasonDiaryId).select('_id user_id').lean();
	if (!diary) {
		throw createError(404, 'Season diary not found');
	}
};

const viewIrrigationCostsList = async ({
	page,
	limit,
	seasonDiaryId,
}) => {
	const pageNumber = parsePage(page);
	const limitNumber = parseLimit(limit);
	const skip = (pageNumber - 1) * limitNumber;
	const query = { season_diary_id: { $ne: null } };

	if (seasonDiaryId) {
		await ensureSeasonDiaryExists({ seasonDiaryId });
		query.season_diary_id = seasonDiaryId;
	}

	const [items, total] = await Promise.all([
		IrrigationCostsModel.find(query)
			.select('-created_by -__v')
			.populate({
				path: 'season_diary_id',
				select: 'garden_name status user_id',
			})
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(limitNumber)
			.lean(),
		IrrigationCostsModel.countDocuments(query),
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

const createIrrigationCosts = async ({ userId, data }) => {
	if (!data?.season_diary_id) {
		throw createError(400, 'season_diary_id is required');
	}

	await ensureSeasonDiaryExists({ seasonDiaryId: data?.season_diary_id });

	const payload = {
		...sanitizeIrrigationPayload(data),
		created_by: userId,
	};

	payload.execution_date = normalizeExecutionDate(payload.execution_date);

	const created = await IrrigationCostsModel.create(payload);
	return created;
};

const updateIrrigationCosts = async ({ irrigationCostId, data }) => {
	const existing = await IrrigationCostsModel.findById(irrigationCostId);
	if (!existing) {
		throw createError(404, 'Irrigation costs log not found');
	}

	const targetSeasonDiaryId = data?.season_diary_id || existing.season_diary_id;
	await ensureSeasonDiaryExists({ seasonDiaryId: targetSeasonDiaryId });

	const payload = sanitizeIrrigationPayload(data);
	if (Object.prototype.hasOwnProperty.call(payload, 'execution_date')) {
		payload.execution_date = normalizeExecutionDate(payload.execution_date);
	}

	delete payload.created_by;

	Object.assign(existing, payload);
	const updated = await existing.save();
	return updated;
};

const deleteIrrigationCosts = async ({ irrigationCostId }) => {
	const existing = await IrrigationCostsModel.findById(irrigationCostId)
		.select('_id created_by')
		.lean();

	if (!existing) {
		throw createError(404, 'Irrigation costs log not found');
	}

	await IrrigationCostsModel.findByIdAndDelete(irrigationCostId);
	return true;
};

export const irrigationCostsService = {
	viewIrrigationCostsList,
	createIrrigationCosts,
	updateIrrigationCosts,
	deleteIrrigationCosts,
};
