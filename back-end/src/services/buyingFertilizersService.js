import { BuyingFertilizersModel } from '@/model/buyingFertilizersModel';
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

const viewBuyingFertilizersList = async ({
	page,
	limit,
	seasonDiaryId,
	userId,
	role,
}) => {
	try {
		const pageNumber = parsePage(page);
		const limitNumber = parseLimit(limit);
		const skip = (pageNumber - 1) * limitNumber;
		const query = seasonDiaryId ? { season_diary_id: seasonDiaryId } : {};

		if (seasonDiaryId) {
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
		}

		const [items, total] = await Promise.all([
			BuyingFertilizersModel.find(query)
				.populate({
					path: 'season_diary_id',
					select: 'garden_name status user_id',
				})
				.sort({ created_at: -1 })
				.skip(skip)
				.limit(limitNumber)
				.lean(),
			BuyingFertilizersModel.countDocuments(query),
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

const createBuyingFertilizers = async ({ userId, role, data }) => {
	try {
		const diary = await SeasonDiaryModel.findById(data.season_diary_id)
			.select('_id user_id')
			.lean();

		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		const isOwner = toObjectIdString(diary.user_id) === toObjectIdString(userId);
		if (!isOwner && role !== 'admin') {
			throw createError(403, 'You do not have permission to access this season diary');
		}

		const created = await BuyingFertilizersModel.create(data);
		return created;
	} catch (error) {
		throw error;
	}
};

const updateBuyingFertilizers = async ({ buyingFertilizersId, userId, role, data }) => {
	try {
		const existing = await BuyingFertilizersModel.findById(buyingFertilizersId);
		if (!existing) {
			throw createError(404, 'Buying fertilizers not found');
		}

		const diary = await SeasonDiaryModel.findById(existing.season_diary_id)
			.select('_id user_id')
			.lean();

		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		const isOwner = toObjectIdString(diary.user_id) === toObjectIdString(userId);
		if (!isOwner && role !== 'admin') {
			throw createError(403, 'You do not have permission to access this season diary');
		}

		delete data.season_diary_id;

		Object.assign(existing, data);
		const updated = await existing.save();
		return updated;
	} catch (error) {
		throw error;
	}
};

const deleteBuyingFertilizers = async ({ buyingFertilizersId, userId, role }) => {
	try {
		const existing = await BuyingFertilizersModel.findById(buyingFertilizersId)
			.select('_id season_diary_id')
			.lean();

		if (!existing) {
			throw createError(404, 'Buying fertilizers not found');
		}

		const diary = await SeasonDiaryModel.findById(existing.season_diary_id)
			.select('_id user_id')
			.lean();

		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		const isOwner = toObjectIdString(diary.user_id) === toObjectIdString(userId);
		if (!isOwner && role !== 'admin') {
			throw createError(403, 'You do not have permission to access this season diary');
		}

		await BuyingFertilizersModel.findByIdAndDelete(buyingFertilizersId);
		return true;
	} catch (error) {
		throw error;
	}
};

export const buyingFertilizersService = {
	viewBuyingFertilizersList,
	createBuyingFertilizers,
	updateBuyingFertilizers,
	deleteBuyingFertilizers,
};
