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
        const diaryId = req.params;
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
}

export const diaryController = {
	getDiariesByUser,
	createDiary,
    updateDiary,
};
