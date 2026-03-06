import { diaryService } from '@/services/diaryService';

const ALLOWED_ACTION_TYPES = ['Vật tư', 'Công việc', 'Chỉ số'];

// Get all diaries
const getDiariesByUser = async (req, res, next) => {
	try {
		const filter = { ...req.query, ...(req.body?.filter || {}) };
		const diaries = await diaryService.getDiariesByUser({
			garden_id: filter.garden_id,
			year: filter.year,
		});
		res.status(200).json({
			code: 200,
			message: 'Diaries retrieved successfully',
			data: diaries,
		});
	} catch (error) {
		next(error);
	}
};

// Create diary
const createDiary = async (req, res, next) => {
	try {
		const { title, description, garden_id } = req.body;
		// Validate required fields
		if (!title || !description || !garden_id) {
			return res.status(400).json({
				code: 400,
				message: 'Title, description, and garden_id are required fields',
			});
		}
		const userId = req.user.id;
		const newDiary = await diaryService.createDiary({
			user_id: userId,
			garden_id,
			title,
			description,
		});
		res.status(201).json({
			code: 201,
			message: 'Thiết lập nhật ký thành công',
			data: newDiary,
		});
	} catch (error) {
		next(error);
	}
};

// Update diary
const updateDiary = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const { title, description } = req.body;
		const updatedDiary = await diaryService.updateDiary(diaryId, {
			title,
			description,
		});
		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật ký thành công',
			data: updatedDiary,
		});
	} catch (error) {
		next(error);
	}
};

// Finish diary
const finishDiary = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const { weight_durian, price } = req.body;
		const updatedDiary = await diaryService.finishDiary(diaryId, {
			weight_durian,
			price,
		});
		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật ký thành công',
			data: updatedDiary,
		});
	} catch (error) {
		next(error);
	}
};

// Get diary details
const getDiaryDetails = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const diary = await diaryService.getDiaryDetails(diaryId);
		if (!diary) {
			return res.status(404).json({
				code: 404,
				message: 'Diary not found',
			});
		}
		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật ký thành công',
			data: diary,
		});
	} catch (error) {
		next(error);
	}
};

// Delete diary
const deleteDiary = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const deletedDiary = await diaryService.deleteDiary(diaryId);
		if (!deletedDiary) {
			return res.status(404).json({
				code: 404,
				message: 'Diary not found',
			});
		}
		res.status(200).json({
			code: 200,
			message: 'Diary deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

// Get steps by diary ID
const getStepsByDiaryId = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const steps = await diaryService.getStepsByDiaryId(diaryId);
		res.status(200).json({
			code: 200,
			message: 'Diary steps retrieved successfully',
			data: steps,
		});
	} catch (error) {
		next(error);
	}
};

// Update diary step
const updateDiaryStep = async (req, res, next) => {
	try {
		const { stepId } = req.params;
		const updateData = req.body;

		if (
			Object.prototype.hasOwnProperty.call(updateData, 'action_type') &&
			!ALLOWED_ACTION_TYPES.includes(updateData.action_type)
		) {
			return res.status(400).json({
				code: 400,
				message: 'action_type must be one of: Vật tư, Công việc, Chỉ số',
			});
		}

		const updatedStep = await diaryService.updateDiaryStep(stepId, updateData);

		if (!updatedStep) {
			return res.status(404).json({
				code: 404,
				message: 'Diary step not found',
			});
		}

		res.status(200).json({
			code: 200,
			message: 'Diary step updated successfully',
			data: updatedStep,
		});
	} catch (error) {
		next(error);
	}
};

// Add diary step
const addDiaryStep = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const stepData = req.body;

		if (!stepData.action_type) {
			return res.status(400).json({
				code: 400,
				message: 'action_type is required',
			});
		}

		if (!ALLOWED_ACTION_TYPES.includes(stepData.action_type)) {
			return res.status(400).json({
				code: 400,
				message: 'action_type must be one of: Vật tư, Công việc, Chỉ số',
			});
		}

		const newStep = await diaryService.addDiaryStep(diaryId, stepData);
		res.status(201).json({
			code: 201,
			message: 'Diary step added successfully',
			data: newStep,
		});
	} catch (error) {
		next(error);
	}
};

// Delete diary step
const deleteDiaryStep = async (req, res, next) => {
	try {
		const { stepId } = req.params;
		const deletedStep = await diaryService.deleteDiaryStep(stepId);
		if (!deletedStep) {
			return res.status(404).json({
				code: 404,
				message: 'Diary step not found',
			});
		}
		res.status(200).json({
			code: 200,
			message: 'Diary step deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

const statisticsDiary = async (req, res, next) => {
	try {
		const { diaryId } = req.params;
		const stats = await diaryService.statisticsDiary(diaryId);
		res.status(200).json({
			code: 200,
			message: 'Diary statistics retrieved successfully',
			data: stats,
		});
	} catch (error) {
		next(error);
	}
};

export const diaryController = {
	getDiariesByUser,
	createDiary,
	updateDiary,
	finishDiary,
	getDiaryDetails,
	deleteDiary,
	getStepsByDiaryId,
	updateDiaryStep,
	addDiaryStep,
	deleteDiaryStep,
	statisticsDiary,
};
