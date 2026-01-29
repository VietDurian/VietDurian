import { stepService } from '@/services/stepService';

// Get all steps
const getAllSteps = async (req, res, next) => {
	try {
		const {search} = req.query;
		const steps = await stepService.getAllSteps({search});
		res.status(200).json({
			code: 200,
			message: 'Steps retrieved successfully',
			data: steps,
		});
	} catch (error) {
		next(error);
	}
};

// Create a new step
const createStep = async (req, res, next) => {
	try {
		const { parent_id, title, description } = req.body;
		// Validate input
		if (
			!title ||
			typeof title !== 'string' ||
			!description ||
			typeof description !== 'string'
		) {
			return res.status(400).json({
				code: 400,
				message: 'Invalid input',
			});
		}
		// Call service to create step
		const newStep = await stepService.createStep({
			parent_id,
			title,
			description,
		});
		res.status(201).json({
			code: 201,
			message: 'Step created successfully',
			data: newStep,
		});
	} catch (error) {
		next(error);
	}
};

// Get step by ID
const getStepById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const step = await stepService.getStepById({ id });
        res.status(200).json({
            code: 200,
            message: 'Step retrieved successfully',
            data: step
        });
    } catch (error) {
        next(error);
    }
}

// Update a step
const updateStep = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, description } = req.body;
		// Validate input
		if (
			!title ||
			typeof title !== 'string' ||
			!description ||
			typeof description !== 'string'
		) {
			return res.status(400).json({
				code: 400,
				message: 'Invalid input',
			});
		}
		// Call service to update step
		const updatedStep = await stepService.updateStep({
			id,
			title,
			description,
		});
		res.status(200).json({
			code: 200,
			message: 'Step updated successfully',
			data: updatedStep,
		});
	} catch (error) {
		next(error);
	}
};

// Delete a step
const deleteStep = async (req, res, next) => {
	try {
		const { id } = req.params;
		const result = await stepService.deleteStep({ id });
		res.status(200).json({
			code: 200,
			message: 'Step deleted successfully',
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const stepController = {
	getAllSteps,
	deleteStep,
	createStep,
	getStepById,
	updateStep,
};
