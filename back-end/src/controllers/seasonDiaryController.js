import { seasonDiaryService } from '@/services/seasonDiaryService';

const viewSeasonDiaryList = async (req, res, next) => {
	try {
		const { status, userId, user_id } = req.query;

		const diaries = await seasonDiaryService.getSeasonDiaryList({
			status,
			userId: userId || user_id,
		});

		res.status(200).json({
			code: 200,
			message: 'Season diary list retrieved successfully',
			data: diaries,
		});
	} catch (error) {
		next(error);
	}
};

const viewSeasonDiaryDetail = async (req, res, next) => {
	try {
		const { season_diary_id } = req.params;

		const diary = await seasonDiaryService.getSeasonDiaryDetail(season_diary_id);

		res.status(200).json({
			code: 200,
			message: 'Season diary detail retrieved successfully',
			data: diary,
		});
	} catch (error) {
		next(error);
	}
};

const createSeasonDiary = async (req, res, next) => {
	try {
		const {
			garden_name,
			farmer_name,
			location,
			longitude,
			latitude,
			crop_variety,
			area,
		} = req.body;

		if (
			!garden_name ||
			!farmer_name ||
			!location ||
			!longitude ||
			!latitude ||
			!crop_variety ||
			!area
		) {
			return res.status(400).json({
				code: 400,
				message:
					'garden_name, farmer_name, location, longitude, latitude, crop_variety, and area are required',
			});
		}

		const userId = req.user?.id || req.user?._id;

		const diary = await seasonDiaryService.createSeasonDiary({
			userId,
			data: req.body,
		});

		res.status(201).json({
			code: 201,
			message: 'Season diary created successfully',
			data: diary,
		});
	} catch (error) {
		next(error);
	}
};

const updateSeasonDiary = async (req, res, next) => {
	try {
		const { season_diary_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		if (!Object.keys(req.body || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		const diary = await seasonDiaryService.updateSeasonDiary({
			seasonDiaryId: season_diary_id,
			data: req.body,
		});

		res.status(200).json({
			code: 200,
			message: 'Season diary updated successfully',
			data: diary,
		});
	} catch (error) {
		next(error);
	}
};

const deleteSeasonDiary = async (req, res, next) => {
	try {
		const { season_diary_id } = req.params;

		await seasonDiaryService.deleteSeasonDiary({
			seasonDiaryId: season_diary_id,
		});

		res.status(200).json({
			code: 200,
			message: 'Season diary deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

const finishSeasonDiary = async (req, res, next) => {
	try {
		const { season_diary_id } = req.params;

		const diary = await seasonDiaryService.finishSeasonDiary({
			seasonDiaryId: season_diary_id,
		});

		res.status(200).json({
			code: 200,
			message: 'Season diary marked as completed successfully',
			data: diary,
		});
	} catch (error) {
		next(error);
	}
};


export const seasonDiaryController = {
	viewSeasonDiaryList,
	viewSeasonDiaryDetail,
	createSeasonDiary,
	updateSeasonDiary,
	deleteSeasonDiary,
	finishSeasonDiary,
};
