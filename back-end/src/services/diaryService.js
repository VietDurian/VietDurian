import { DiaryModel } from '@/model/diaryModel';
import { DiaryStepModel } from '@/model/diaryStepModel';

// Get all diaries
const getDiariesByUser = async (filters) => {
	try {
		// Chỉ lấy user_id từ filters, bỏ qua các tham số rác khác
		const query = {};
		if (filters.user_id) {
			query.user_id = filters.user_id;
		}
		if (!query.user_id) return [];
		const diaries = await DiaryModel.find(query);
		return diaries;
	} catch (error) {
		throw error;
	}
};

// Create diary
const createDiary = async ({ user_id, title, description, crop_type }) => {
	try {
		const newDiary = new DiaryModel({
			user_id,
			title,
			description,
            crop_type,
		});
		await newDiary.save();
		return newDiary;
	} catch (error) {
		throw error;
	}
};

// Update diary
const updateDiary = async (diaryId, updateData) => {
    try {
        const updatedDiary = await DiaryModel.findByIdAndUpdate(
            diaryId,
            updateData,
            { new: true }
        );
        return updatedDiary;
    } catch (error) {
        throw error;
    }
}

export const diaryService = {
	getDiariesByUser,
	createDiary,
    updateDiary,
};
