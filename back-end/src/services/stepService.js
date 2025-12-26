import { StepModel } from '@/model/stepModel';

// Get all steps
const getAllSteps = async () => {
	try {
		// chi lay nhung thang ko co parent_id (la step cha)
		const steps = await StepModel.find({ parent_id: null });
		return steps;
	} catch (error) {
		throw error;
	}
};

// Create a new step
const createStep = async ({ parent_id, title, description }) => {
	try {
		if (parent_id) {
			const parent = await StepModel.findById(parent_id);
			if (!parent) {
				throw new Error('Parent step not found');
			}
		}
		// Create a new Step instance
		const newStep = new StepModel({ parent_id, title, description });
		// Save to database
		const savedStep = await newStep.save();
		return savedStep;
	} catch (error) {
		throw error;
	}
};

// Get step by ID
const getStepById = async ({ id }) => {
	try {
		const step = await StepModel.findById(id);
		return step;
	} catch (error) {
		throw error;
	}
};

// Update a step
const updateStep = async ({ id, title, description }) => {
	try {
		const updatedStep = await StepModel.findByIdAndUpdate(
			id,
			{ title, description },
			{ new: true }
		);
		return updatedStep;
	} catch (error) {
		throw error;
	}
};

// Delete a step
const deleteStep = async ({ id }) => {
	try {
		const result = await StepModel.findByIdAndDelete(id);
		return result;
	} catch (error) {
		throw error;
	}
};

export const stepService = {
	getAllSteps,
	deleteStep,
	updateStep,
	createStep,
	getStepById,
};
