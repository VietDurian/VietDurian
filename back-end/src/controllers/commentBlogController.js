import { commentBlogService as commentService } from '../services/commentBlogService.js';

// Get all comments
const getAllComments = async (req, res, next) => {
	try {
		const comments = await commentService.getAllComments();
		res.status(200).json(comments);
	} catch (error) {
		next(error);
	}
};

// Create a new comment
const createComment = async (req, res, next) => {
	try {
		const payload = { ...req.body, userId: req.user._id };
		const newComment = await commentService.createComment(payload);
		res.json({
			code: 201,
			message: 'Comment created successfully',
			data: newComment,
		});
	} catch (error) {
		next(error);
	}
};

// Get comments by Blog ID
const getCommentsByBlogId = async (req, res, next) => {
	try {
		const { blogId } = req.params;
		const { sort } = req.query;
		const { comments, total } = await commentService.getCommentsByBlogId({
			blogId,
			sort,
		});
		res.status(200).json({
			code: 200,
			message: 'Comments retrieved successfully',
			total: total,
			data: comments,
		});
	} catch (error) {
		next(error);
	}
};

// Update a comment
const updateComment = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { content } = req.body;
		// Validate input
		if (!content || typeof content !== 'string') {
			return res.status(400).json({
				code: 400,
				message: 'Invalid input data',
			});
		}
		const updatedComment = await commentService.updateComment({ id, content });
		res.status(200).json({
			code: 200,
			message: 'Comment updated successfully',
			data: updatedComment,
		});
	} catch (error) {
		next(error);
	}
};

// Delete a comment
const deleteComment = async (req, res, next) => {
	try {
		const { id } = req.params;
		const deletedComment = await commentService.deleteComment({ id });
		res.status(200).json({
			code: 200,
			message: 'Comment deleted successfully',
			data: deletedComment,
		});
	} catch (error) {
		next(error);
	}
};

export const commentBlogController = {
	getAllComments,
	createComment,
	getCommentsByBlogId,
	updateComment,
	deleteComment,
};
