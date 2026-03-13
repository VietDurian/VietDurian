import { useFertilizersService } from '@/services/useFertilizersService';

const viewUseFertilizersList = async (req, res, next) => {
	try {
		const { page, limit, season_diary_id, seasonDiaryId } = req.query;
		const userId = req.user?.id || req.user?._id;

		const result = await useFertilizersService.viewUseFertilizersList({
			page,
			limit,
			seasonDiaryId: season_diary_id || seasonDiaryId,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Use fertilizers list retrieved successfully',
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error) {
		next(error);
	}
};

const createUseFertilizers = async (req, res, next) => {
	try {
		const { season_diary_id, usage_date, fertilizer_name, pesticide_name } = req.body;

		if (!season_diary_id || !usage_date) {
			return res.status(400).json({
				code: 400,
				message: 'season_diary_id and usage_date are required',
			});
		}

		if (!fertilizer_name && !pesticide_name) {
			return res.status(400).json({
				code: 400,
				message: 'At least one of fertilizer_name or pesticide_name is required',
			});
		}

		const userId = req.user?.id || req.user?._id;
		const created = await useFertilizersService.createUseFertilizers({
			userId,
			role: req.user?.role,
			data: req.body,
		});

		res.status(201).json({
			code: 201,
			message: 'Use fertilizers created successfully',
			data: created,
		});
	} catch (error) {
		next(error);
	}
};

const updateUseFertilizers = async (req, res, next) => {
	try {
		const { use_fertilizers_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		if (!Object.keys(req.body || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		const updated = await useFertilizersService.updateUseFertilizers({
			useFertilizersId: use_fertilizers_id,
			userId,
			role: req.user?.role,
			data: req.body,
		});

		res.status(200).json({
			code: 200,
			message: 'Use fertilizers updated successfully',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

const deleteUseFertilizers = async (req, res, next) => {
	try {
		const { use_fertilizers_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		await useFertilizersService.deleteUseFertilizers({
			useFertilizersId: use_fertilizers_id,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Use fertilizers deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

export const useFertilizersController = {
	viewUseFertilizersList,
	createUseFertilizers,
	updateUseFertilizers,
	deleteUseFertilizers,
};
