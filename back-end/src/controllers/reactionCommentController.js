import { reactionCommentService } from '@/services/reactionCommentService';

// Get all reaction comments
const getAllReactionComments = async (req, res, next) => {
	try {
		const reactions = await reactionCommentService.getAllReactionComments();
		res.status(200).json({
			code: 200,
			message: 'Reactions retrieved successfully',
			data: reactions,
		});
	} catch (error) {
		next(error);
	}
};

// Add a reaction to a comment
const addReaction = async (req, res, next) => {
	try {
		const payload = { ...req.body, userId: req.user._id };
		const newReaction = await reactionCommentService.addReaction(payload);
		res.status(201).json({
			code: 201,
			message: 'Reaction added successfully',
			data: newReaction,
		});
	} catch (error) {
		next(error);
	}
};

// Get reactions by comment ID
const getReactionCommentsByCommentId = async (req, res, next) => {
	try {
		const { commentId } = req.params;
		const reactions =
			await reactionCommentService.getReactionCommentsByCommentId({
				commentId,
			});
		res.status(200).json({
			code: 200,
			message: 'Reactions retrieved successfully',
			data: reactions,
		});
	} catch (error) {
		next(error);
	}
};

// Update a reaction
const updateReaction = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { type } = req.body;
		const updatedReaction = await reactionCommentService.updateReaction({
			id,
			type,
		});
		res.status(200).json({
			code: 200,
			message: 'Reaction updated successfully',
			data: updatedReaction,
		});
	} catch (error) {
		next(error);
	}
};

// Delete a reaction
const deleteReaction = async (req, res, next) => {
	try {
		const { id } = req.params;
		await reactionCommentService.deleteReaction({ id });
		res.status(200).json({
			code: 200,
			message: 'Reaction deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

export const reactionCommentController = {
	getAllReactionComments,
	addReaction,
	getReactionCommentsByCommentId,
	updateReaction,
	deleteReaction,
};
