import { diaryService } from '@/services/diaryService';

// Get all diaries
const getDiariesByUser = async (req, res, next) => {
	try {
		const diaries = await diaryService.getDiariesByUser(req.query);
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
		const { title, description, crop_type } = req.body;
		// Validate required fields
		if (!title || !crop_type || !description) {
			return res.status(400).json({
				code: 400,
				message: 'Title, crop_type, and description are required fields',
			});
		}
		const userId = req.user.id;
		const newDiary = await diaryService.createDiary({
			user_id: userId,
			title,
			description,
			crop_type,
		});
		res.status(201).json({
			code: 201,
			message: 'Diary created successfully',
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
		const { title, description, crop_type } = req.body;
		const updatedDiary = await diaryService.updateDiary(diaryId, {
			title,
			description,
			crop_type,
		});
		res.status(200).json({
			code: 200,
			message: 'Diary updated successfully',
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
			message: 'Diary details retrieved successfully',
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

export const diaryController = {
	getDiariesByUser,
	createDiary,
	updateDiary,
	getDiaryDetails,
	deleteDiary,
	getStepsByDiaryId,
	updateDiaryStep,
	addDiaryStep,
	deleteDiaryStep,
};
