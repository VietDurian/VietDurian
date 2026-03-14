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
			message: 'Lấy danh sách nhật ký mùa vụ thành công',
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
			message: 'Lấy chi tiết nhật ký mùa vụ thành công',
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
					'Thiếu dữ liệu bắt buộc: garden_name, farmer_name, location, longitude, latitude, crop_variety, area',
			});
		}

		const userId = req.user?.id || req.user?._id;

		const diary = await seasonDiaryService.createSeasonDiary({
			userId,
			data: req.body,
		});

		res.status(201).json({
			code: 201,
			message: 'Tạo nhật ký mùa vụ thành công',
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
				message: 'Không có trường nào để cập nhật',
			});
		}

		const diary = await seasonDiaryService.updateSeasonDiary({
			seasonDiaryId: season_diary_id,
			data: req.body,
		});

		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật ký mùa vụ thành công',
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
			message: 'Xóa nhật ký mùa vụ thành công',
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
			message: 'Đã hoàn thành nhật ký mùa vụ thành công',
			data: diary,
		});
	} catch (error) {
		next(error);
	}
};

const statisticsSeasonDiary = async (req, res, next) => {
	try {
		const { season_diary_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		const statistics = await seasonDiaryService.getSeasonDiaryStatistics({
			seasonDiaryId: season_diary_id,
			userId,
		});

		res.status(200).json({
			code: 200,
			message: 'Lấy thống kê nhật ký mùa vụ thành công',
			data: statistics,
		});
	} catch (error) {
		next(error);
	}
};

const mapSeasonDiary = async (req, res, next) => {
	try {
		const points = await seasonDiaryService.getSeasonDiaryMapPoints();

		res.status(200).json({
			code: 200,
			message: 'Lấy danh sách vị trí vườn thành công',
			data: points,
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
	statisticsSeasonDiary,
	mapSeasonDiary,
};
