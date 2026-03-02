import { DiaryModel } from '@/model/diaryModel';
import { DiaryStepModel } from '@/model/diaryStepModel';
import { StepModel } from '@/model/stepModel';

// Get all diaries
const getDiariesByUser = async (filter = {}) => {
	try {
		// filter theo dd-mm-yyyy hoặc theo năm, áp dụng trên start_date
		const { garden_id, year } = filter;

		const query = {};

		if (garden_id) {
			query.garden_id = garden_id;
		}

		// Date filters applied on start_date
		const dateRange = {};

		if (year) {
			const y = Number(year);
			if (!Number.isNaN(y)) {
				dateRange.$gte = new Date(y, 0, 1);
				dateRange.$lte = new Date(y, 11, 31, 23, 59, 59, 999);
			}
		}

		if (Object.keys(dateRange).length > 0) {
			query.start_date = dateRange;
		}

		const diaries = await DiaryModel.find(query)
			.sort({ created_at: -1 })
			.populate('garden_id', 'name unit_code crop_type')
			.populate('user_id', 'full_name avatar');
		return diaries;
	} catch (error) {
		throw error;
	}
};

// Create diary
const createDiary = async ({ user_id, garden_id, title, description }) => {
	try {
		const newDiary = new DiaryModel({
			user_id,
			garden_id,
			title,
			description,
		});
		await newDiary.save();
		return newDiary;
	} catch (error) {
		throw error;
	}
};

// Update diary (general fields)
const updateDiary = async (diaryId, { title, description }) => {
	try {
		if (!diaryId) throw new Error('Diary ID is required for update');
		const updatedDiary = await DiaryModel.findByIdAndUpdate(
			diaryId,
			{ title, description },
			{ new: true },
		);
		return updatedDiary;
	} catch (error) {
		throw error;
	}
};

// Finish diary (mark completed with weight & price)
const finishDiary = async (diaryId, { weight_durian, price }) => {
	try {
		if (!diaryId) throw new Error('Diary ID is required for finish');
		if (weight_durian === undefined || price === undefined) {
			throw new Error(
				'Weight durian and price are required when marking diary as Completed',
			);
		}

		const parsedWeightDurian = Number(weight_durian);
		const parsedPrice = Number(price);

		if (Number.isNaN(parsedWeightDurian) || Number.isNaN(parsedPrice)) {
			throw new Error('Weight durian and price must be valid numbers');
		}

		const steps = await DiaryStepModel.find({ diary_id: diaryId }).select(
			'cost',
		);
		const totalCost = steps.reduce(
			(sum, step) => sum + (Number(step.cost) || 0),
			0,
		);
		const totalRevenue = parsedPrice * parsedWeightDurian;
		const profit = totalRevenue - totalCost;

		const end_date = new Date();
		const updatedDiary = await DiaryModel.findByIdAndUpdate(
			diaryId,
			{
				status: 'Completed',
				end_date,
				weight_durian: parsedWeightDurian,
				price: parsedPrice,
				total_cost: totalCost,
				total_revenue: totalRevenue,
				profit,
			},
			{ new: true },
		);

		if (!updatedDiary) throw new Error('Diary not found');

		return updatedDiary;
	} catch (error) {
		throw error;
	}
};

// Get diary details
const getDiaryDetails = async (diaryId) => {
	try {
		const diary = await DiaryModel.findById(diaryId)
			.populate('garden_id', 'name unit_code crop_type')
			.populate('user_id', 'full_name avatar');
		if (!diary) return null;

		// Fetch all stages (parent steps)
		const allStages = await StepModel.find({ parent_id: null }).sort({
			order_index: 1,
		});

		const steps = await DiaryStepModel.find({ diary_id: diaryId })
			.populate('stage_id')
			.sort({ created_at: 1 });

		// Group steps by stage
		const stagesMap = {};

		// Initialize map with all stages
		allStages.forEach((stage) => {
			const stageId = stage._id.toString();
			stagesMap[stageId] = {
				stage_id: stage._id,
				stage_title: stage.title,
				stage_description: stage.description,
				order_index: stage.order_index || 0,
				steps: [],
			};
		});

		steps.forEach((step) => {
			if (step.stage_id) {
				const stageId = step.stage_id._id.toString();
				if (stagesMap[stageId]) {
					stagesMap[stageId].steps.push({
						...step.toObject(),
						stage_id: undefined,
					});
				}
			}
		});

		const stages = Object.values(stagesMap).sort(
			(a, b) => a.order_index - b.order_index,
		);

		return { ...diary.toObject(), stages };
	} catch (error) {
		throw error;
	}
};

// Delete diary
const deleteDiary = async (diaryId) => {
	try {
		const deletedDiary = await DiaryModel.findByIdAndDelete(diaryId);
		return deletedDiary;
	} catch (error) {
		throw error;
	}
};

// Get steps by diary ID
const getStepsByDiaryId = async (diaryId) => {
	try {
		const steps = await DiaryStepModel.find({ diary_id: diaryId }).sort({
			created_at: 1,
		});
		return steps;
	} catch (error) {
		throw error;
	}
};

// Update diary step
const updateDiaryStep = async (stepId, updateData) => {
	try {
		const updatedStep = await DiaryStepModel.findByIdAndUpdate(
			stepId,
			updateData,
			{ new: true },
		);
		return updatedStep;
	} catch (error) {
		throw error;
	}
};

// Add diary step
const addDiaryStep = async (diaryId, stepData) => {
	try {
		const newStep = new DiaryStepModel({
			diary_id: diaryId,
			...stepData,
		});
		await newStep.save();
		return newStep;
	} catch (error) {
		throw error;
	}
};

// Delete diary step
const deleteDiaryStep = async (stepId) => {
	try {
		const deletedStep = await DiaryStepModel.findByIdAndDelete(stepId);
		return deletedStep;
	} catch (error) {
		throw error;
	}
};

// Statistics diary (example implementation)
const statisticsDiary = async (diaryId) => {
	try {
		// in ra lợi nhuận = price - tổng chi phí (tổng cost của tất cả các bước)
		const diary = await DiaryModel.findById(diaryId);
		if (!diary) throw new Error('Diary not found');
		const steps = await DiaryStepModel.find({ diary_id: diaryId });
		const totalCost = steps.reduce(
			(sum, step) => sum + (Number(step.cost) || 0),
			0,
		);
		const totalRevenue =
			(Number(diary.price) || 0) * (Number(diary.weight_durian) || 0);
		const profit = totalRevenue - totalCost;

		// Cập nhật lại diary với các giá trị tính toán
		diary.total_cost = totalCost;
		diary.total_revenue = totalRevenue;
		diary.profit = profit;
		await diary.save();
		return {
			diary_id: diaryId,
			total_cost: totalCost,
			total_revenue: totalRevenue,
			profit,
		};
	} catch (error) {
		throw error;
	}
};

export const diaryService = {
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
