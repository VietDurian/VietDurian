import { SeasonDiaryModel } from '@/model/seasonDiaryModel';
import createError from 'http-errors';
import mongoose from 'mongoose';

const VALID_STATUSES = ['In progressing', 'Completed'];

const escapeRegex = (text = '') =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeGardenName = (name = '') => name.trim();

const ensureValidObjectId = (id, fieldName = 'id') => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw createError(400, `Invalid ${fieldName}`);
	}
};

const ensureUniqueGardenName = async ({ gardenName, excludeId = null }) => {
	const normalizedName = normalizeGardenName(gardenName);
	if (!normalizedName) {
		return;
	}

	const query = {
		garden_name: {
			$regex: `^${escapeRegex(normalizedName)}$`,
			$options: 'i',
		},
	};

	if (excludeId) {
		query._id = { $ne: excludeId };
	}

	const existedDiary = await SeasonDiaryModel.findOne(query).select('_id').lean();
	if (existedDiary) {
		throw createError(409, 'Tên vườn đã tồn tại, vui lòng chọn tên khác');
	}
};

const getSeasonDiaryList = async ({ status, userId }) => {
	try {
		const query = {};

		if (status) {
			if (!VALID_STATUSES.includes(status)) {
				throw createError(400, 'Invalid status value');
			}
			query.status = status;
		}

		if (userId) {
			ensureValidObjectId(userId, 'userId');
			query.user_id = userId;
		}

		const diaries = await SeasonDiaryModel.find(query)
			.populate({
				path: 'user_id',
				select: 'full_name email avatar',
			})
			.sort({ created_at: -1 })
			.lean();

		return diaries;
	} catch (error) {
		throw error;
	}
};

const getSeasonDiaryDetail = async (seasonDiaryId) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId)
			.populate({
				path: 'user_id',
				select: 'full_name email avatar',
			})
			.lean();

		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		return diary;
	} catch (error) {
		throw error;
	}
};

const createSeasonDiary = async ({ userId, data }) => {
	try {
		await ensureUniqueGardenName({ gardenName: data.garden_name });

		const newDiary = new SeasonDiaryModel({
			...data,
			garden_name: normalizeGardenName(data.garden_name),
			user_id: userId,
		});

		const savedDiary = await newDiary.save();
		return savedDiary;
	} catch (error) {
		throw error;
	}
};

const updateSeasonDiary = async ({ seasonDiaryId, data }) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId);
		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		delete data.status;
		delete data.end_date;

		if (typeof data.garden_name === 'string') {
			await ensureUniqueGardenName({
				gardenName: data.garden_name,
				excludeId: seasonDiaryId,
			});
			data.garden_name = normalizeGardenName(data.garden_name);
		}

		Object.assign(diary, data);
		const updatedDiary = await diary.save();

		return updatedDiary;
	} catch (error) {
		throw error;
	}
};

const deleteSeasonDiary = async ({ seasonDiaryId}) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId);
		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		if (diary.status !== 'In progressing') {
			throw createError(
				400,
				'Only season diaries with status "In progressing" can be deleted',
			);
		}

		await SeasonDiaryModel.findByIdAndDelete(seasonDiaryId);
		return true;
	} catch (error) {
		throw error;
	}
};

const finishSeasonDiary = async ({ seasonDiaryId }) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId);
		if (!diary) {
			throw createError(404, 'Season diary not found');
		}

		diary.status = 'Completed';
		diary.end_date = new Date();

		const updatedDiary = await diary.save();
		return updatedDiary;
	} catch (error) {
		throw error;
	}
};



export const seasonDiaryService = {
	getSeasonDiaryList,
	getSeasonDiaryDetail,
	createSeasonDiary,
	updateSeasonDiary,
	deleteSeasonDiary,
	finishSeasonDiary,
};
