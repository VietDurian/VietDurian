import { IrrigationCostsModel } from '@/model/irrigationCostsModel';
import { SeasonDiaryModel } from '@/model/seasonDiaryModel';
import createError from 'http-errors';

const toObjectIdString = (value) => value?.toString();

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
		return value;
	}

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		throw createError(400, 'execution_date must be a valid date in YYYY-MM-DD format');
	}

	return parsedDate.toISOString().slice(0, 10);
};

const normalizeCostNumber = (value) => {
	if (value === undefined || value === null || value === '') {
		return value === '' ? null : value;
	}

	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw createError(400, 'electricity_fuel_cost must be a number (double), not text');
	}

	return value;
};

const sanitizeIrrigationPayload = (payload) => {
	const sanitized = { ...payload };

	delete sanitized.water_source;
	delete sanitized.maintenance_repair_cost;

	if (Object.prototype.hasOwnProperty.call(sanitized, 'electricity_fuel_cost')) {
		sanitized.electricity_fuel_cost = normalizeCostNumber(
			sanitized.electricity_fuel_cost,
		);
	}

	return sanitized;
};

const ensureSeasonDiaryAccess = async ({ seasonDiaryId, userId, role }) => {
	if (!seasonDiaryId) {
		return;
	}

	const diary = await SeasonDiaryModel.findById(seasonDiaryId).select('_id user_id').lean();
	if (!diary) {
		throw createError(404, 'Season diary not found');
	}

	const isOwner = toObjectIdString(diary.user_id) === toObjectIdString(userId);
	if (!isOwner && role !== 'admin') {
		throw createError(403, 'You do not have permission to access this season diary');
	}
};

const viewIrrigationCostsList = async ({
	page,
	limit,
	seasonDiaryId,
	userId,
	role,
}) => {
	const pageNumber = parsePage(page);
	const limitNumber = parseLimit(limit);
	const skip = (pageNumber - 1) * limitNumber;
	const query = { season_diary_id: { $ne: null } };

	if (seasonDiaryId) {
		await ensureSeasonDiaryAccess({ seasonDiaryId, userId, role });
		query.season_diary_id = seasonDiaryId;
	} else if (role !== 'admin') {
		query.created_by = userId;
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

const createIrrigationCosts = async ({ userId, role, data }) => {
	if (!data?.season_diary_id) {
		throw createError(400, 'season_diary_id is required');
	}

	await ensureSeasonDiaryAccess({
		seasonDiaryId: data?.season_diary_id,
		userId,
		role,
	});

	const payload = {
		...sanitizeIrrigationPayload(data),
		created_by: userId,
	};

	payload.execution_date = normalizeExecutionDate(payload.execution_date);

	const created = await IrrigationCostsModel.create(payload);
	return created;
};

const updateIrrigationCosts = async ({ irrigationCostId, userId, role, data }) => {
	const existing = await IrrigationCostsModel.findById(irrigationCostId);
	if (!existing) {
		throw createError(404, 'Irrigation costs log not found');
	}

	const isCreator =
		toObjectIdString(existing.created_by) === toObjectIdString(userId) || role === 'admin';
	if (!isCreator) {
		throw createError(403, 'You do not have permission to update this log');
	}

	const targetSeasonDiaryId = data?.season_diary_id || existing.season_diary_id;
	await ensureSeasonDiaryAccess({ seasonDiaryId: targetSeasonDiaryId, userId, role });

	const payload = sanitizeIrrigationPayload(data);
	if (Object.prototype.hasOwnProperty.call(payload, 'execution_date')) {
		payload.execution_date = normalizeExecutionDate(payload.execution_date);
	}

	delete payload.created_by;

	Object.assign(existing, payload);
	const updated = await existing.save();
	return updated;
};

const deleteIrrigationCosts = async ({ irrigationCostId, userId, role }) => {
	const existing = await IrrigationCostsModel.findById(irrigationCostId)
		.select('_id created_by')
		.lean();

	if (!existing) {
		throw createError(404, 'Irrigation costs log not found');
	}

	const isCreator =
		toObjectIdString(existing.created_by) === toObjectIdString(userId) || role === 'admin';
	if (!isCreator) {
		throw createError(403, 'You do not have permission to delete this log');
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
