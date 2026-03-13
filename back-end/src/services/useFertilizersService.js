import { UseFertilizersModel } from '@/model/useFertilizersModel';
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

const ensureDiaryAccess = async ({ seasonDiaryId, userId, role }) => {
	const diary = await SeasonDiaryModel.findById(seasonDiaryId)
		.select('_id user_id')
		.lean();

	if (!diary) {
		throw createError(404, 'Season diary not found');
	}

	const isOwner = toObjectIdString(diary.user_id) === toObjectIdString(userId);
	if (!isOwner && role !== 'admin') {
		throw createError(403, 'You do not have permission to access this season diary');
	}
};

const ensureUsagePayload = (data) => {
	if (!data.fertilizer_name && !data.pesticide_name) {
		throw createError(
			400,
			'At least one of fertilizer_name or pesticide_name is required',
		);
	}
};

const viewUseFertilizersList = async ({ page, limit, seasonDiaryId, userId, role }) => {
	try {
		const pageNumber = parsePage(page);
		const limitNumber = parseLimit(limit);
		const skip = (pageNumber - 1) * limitNumber;
		const query = seasonDiaryId ? { season_diary_id: seasonDiaryId } : {};

		if (seasonDiaryId) {
			await ensureDiaryAccess({ seasonDiaryId, userId, role });
		}

		const [items, total] = await Promise.all([
			UseFertilizersModel.find(query)
				.populate({
					path: 'season_diary_id',
					select: 'garden_name status user_id',
				})
				.sort({ usage_date: -1, created_at: -1 })
				.skip(skip)
				.limit(limitNumber)
				.lean(),
			UseFertilizersModel.countDocuments(query),
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
	} catch (error) {
		throw error;
	}
};

const createUseFertilizers = async ({ userId, role, data }) => {
	try {
		await ensureDiaryAccess({
			seasonDiaryId: data.season_diary_id,
			userId,
			role,
		});

		ensureUsagePayload(data);

		const created = await UseFertilizersModel.create(data);
		return created;
	} catch (error) {
		throw error;
	}
};

const updateUseFertilizers = async ({ useFertilizersId, userId, role, data }) => {
	try {
		const existing = await UseFertilizersModel.findById(useFertilizersId);
		if (!existing) {
			throw createError(404, 'Use fertilizers record not found');
		}

		await ensureDiaryAccess({
			seasonDiaryId: existing.season_diary_id,
			userId,
			role,
		});

		delete data.season_diary_id;

		const mergedData = {
			fertilizer_name: data.fertilizer_name ?? existing.fertilizer_name,
			pesticide_name: data.pesticide_name ?? existing.pesticide_name,
		};
		if (!mergedData.fertilizer_name && !mergedData.pesticide_name) {
			throw createError(
				400,
				'At least one of fertilizer_name or pesticide_name is required',
			);
		}

		Object.assign(existing, data);
		const updated = await existing.save();
		return updated;
	} catch (error) {
		throw error;
	}
};

const deleteUseFertilizers = async ({ useFertilizersId, userId, role }) => {
	try {
		const existing = await UseFertilizersModel.findById(useFertilizersId)
			.select('_id season_diary_id')
			.lean();

		if (!existing) {
			throw createError(404, 'Use fertilizers record not found');
		}

		await ensureDiaryAccess({
			seasonDiaryId: existing.season_diary_id,
			userId,
			role,
		});

		await UseFertilizersModel.findByIdAndDelete(useFertilizersId);
		return true;
	} catch (error) {
		throw error;
	}
};

export const useFertilizersService = {
	viewUseFertilizersList,
	createUseFertilizers,
	updateUseFertilizers,
	deleteUseFertilizers,
};
