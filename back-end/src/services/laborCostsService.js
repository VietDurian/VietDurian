import { LaborCostsModel } from '@/model/laborCostsModel';
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

const normalizeDate = (value) => {
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
			throw createError(400, 'labor_hire_date must be a valid date in YYYY-MM-DD format');
		}
		return parsedDate;
	}

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) {
		throw createError(400, 'labor_hire_date must be a valid date in YYYY-MM-DD format');
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

const normalizeWorkingTime = (value) => {
	if (value === undefined || value === null || value === '') {
		return value === '' ? null : value;
	}

	if (typeof value !== 'object' || Array.isArray(value)) {
		throw createError(400, 'working_time must be an object with hours and minutes');
	}

	const normalized = {};

	if (Object.prototype.hasOwnProperty.call(value, 'hours')) {
		const hours = normalizeNumber(value.hours, 'working_time.hours');
		if (hours !== null && hours !== undefined && hours < 0) {
			throw createError(400, 'working_time.hours must be >= 0');
		}
		normalized.hours = hours;
	}

	if (Object.prototype.hasOwnProperty.call(value, 'minutes')) {
		const minutes = normalizeNumber(value.minutes, 'working_time.minutes');
		if (minutes !== null && minutes !== undefined) {
			if (minutes < 0 || minutes > 59) {
				throw createError(400, 'working_time.minutes must be between 0 and 59');
			}
		}
		normalized.minutes = minutes;
	}

	return normalized;
};

const sanitizePayload = (payload) => {
	const sanitized = { ...payload };

	if (Object.prototype.hasOwnProperty.call(sanitized, 'worker_quantity')) {
		sanitized.worker_quantity = normalizeNumber(sanitized.worker_quantity, 'worker_quantity');
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'working_time_hours_per_day')) {
		sanitized.working_time = {
			hours: normalizeNumber(
				sanitized.working_time_hours_per_day,
				'working_time_hours_per_day',
			),
			minutes: 0,
		};
		delete sanitized.working_time_hours_per_day;
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'working_time')) {
		sanitized.working_time = normalizeWorkingTime(sanitized.working_time);
	}

	if (
		Object.prototype.hasOwnProperty.call(sanitized, 'unit_price_vnd') &&
		!Object.prototype.hasOwnProperty.call(sanitized, 'total_price_vnd')
	) {
		sanitized.total_price_vnd = normalizeNumber(
			sanitized.unit_price_vnd,
			'unit_price_vnd',
		);
		delete sanitized.unit_price_vnd;
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'total_price_vnd')) {
		sanitized.total_price_vnd = normalizeNumber(
			sanitized.total_price_vnd,
			'total_price_vnd',
		);
	}

	if (Object.prototype.hasOwnProperty.call(sanitized, 'labor_hire_date')) {
		sanitized.labor_hire_date = normalizeDate(sanitized.labor_hire_date);
	}

	// Explicitly drop unsupported field from legacy UI/forms.
	delete sanitized.total_cost;

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

const viewLaborCostsList = async ({ page, limit, seasonDiaryId, userId, role }) => {
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
		LaborCostsModel.find(query)
			.select('-created_by -__v')
			.populate({
				path: 'season_diary_id',
				select: 'garden_name status user_id',
			})
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(limitNumber)
			.lean(),
		LaborCostsModel.countDocuments(query),
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

const createLaborCosts = async ({ userId, role, data }) => {
	if (!data?.season_diary_id) {
		throw createError(400, 'season_diary_id is required');
	}

	await ensureSeasonDiaryAccess({
		seasonDiaryId: data.season_diary_id,
		userId,
		role,
	});

	const payload = {
		...sanitizePayload(data),
		created_by: userId,
	};

	const created = await LaborCostsModel.create(payload);
	return created;
};

const updateLaborCosts = async ({ laborCostId, userId, role, data }) => {
	const existing = await LaborCostsModel.findById(laborCostId);
	if (!existing) {
		throw createError(404, 'Labor costs log not found');
	}

	const isCreator =
		toObjectIdString(existing.created_by) === toObjectIdString(userId) || role === 'admin';
	if (!isCreator) {
		throw createError(403, 'You do not have permission to update this log');
	}

	const targetSeasonDiaryId = data?.season_diary_id || existing.season_diary_id;
	await ensureSeasonDiaryAccess({ seasonDiaryId: targetSeasonDiaryId, userId, role });

	const payload = sanitizePayload(data);
	delete payload.created_by;

	Object.assign(existing, payload);
	const updated = await existing.save();
	return updated;
};

const deleteLaborCosts = async ({ laborCostId, userId, role }) => {
	const existing = await LaborCostsModel.findById(laborCostId)
		.select('_id created_by')
		.lean();

	if (!existing) {
		throw createError(404, 'Labor costs log not found');
	}

	const isCreator =
		toObjectIdString(existing.created_by) === toObjectIdString(userId) || role === 'admin';
	if (!isCreator) {
		throw createError(403, 'You do not have permission to delete this log');
	}

	await LaborCostsModel.findByIdAndDelete(laborCostId);
	return true;
};

export const laborCostsService = {
	viewLaborCostsList,
	createLaborCosts,
	updateLaborCosts,
	deleteLaborCosts,
};
