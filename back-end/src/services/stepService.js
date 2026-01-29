import { StepModel } from '@/model/stepModel';

// Normalize text by removing accents and converting to lowercase
const normalizeText = (value = '') =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

// Get all steps (accent-insensitive search)
const getAllSteps = async ({ search }) => {
	try {
		// Only fetch parent steps; filter in Node to ignore diacritics
		const steps = await StepModel.find({ parent_id: null })
			.select('parent_id title description order_index created_at updated_at')
			.lean();

		if (search) {
			const keyword = normalizeText(search);
			return steps.filter(
				(step) =>
					normalizeText(step.title).includes(keyword) ||
					normalizeText(step.description).includes(keyword),
			);
		}

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
			{ new: true },
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
