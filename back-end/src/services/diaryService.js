import { DiaryModel } from "@/model/diaryModel";
import { DiaryStepModel } from "@/model/diaryStepModel";
import { StepModel } from "@/model/stepModel";

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

    // Get all parent steps (where parent_id is null)
    const parentSteps = await StepModel.find({ parent_id: null });

    // Create DiaryStep for each parent step
    if (parentSteps.length > 0) {
      const diarySteps = parentSteps.map((step) => ({
        diary_id: newDiary._id,
        stage_id: step._id,
        step_name: step.title,
        description: step.description,
      }));

      await DiaryStepModel.insertMany(diarySteps);
    }

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
      { new: true, runValidators: true }
    );
    return updatedDiary;
  } catch (error) {
    throw error;
  }
};

// Get diary details
const getDiaryDetails = async (diaryId) => {
  try {
    const diary = await DiaryModel.findById(diaryId);
    if (!diary) return null;

    // Fetch all stages (parent steps)
    const allStages = await StepModel.find({ parent_id: null }).sort({
      order_index: 1,
    });

    const steps = await DiaryStepModel.find({ diary_id: diaryId })
      .populate("stage_id")
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
      (a, b) => a.order_index - b.order_index
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
      { new: true }
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

export const diaryService = {
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
