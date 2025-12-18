import { CommentBlogModel } from '@/model/commentBlogModel';
import UserModel from '@/model/userModel';

// Get all comments
const getAllComments = async () => {
	try {
		const comments = await CommentBlogModel.find().lean();
		return comments;
	} catch (error) {
		throw error;
	}
};

// Create a new comment
const createComment = async (payload) => {
	try {
		const { blog_id, userId, parent_id, content } = payload;

		// Validate user existence
		const user = await UserModel.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Validate parent comment existence if parent_id is provided

		// Create a new CommentBlog instance
		const newComment = new CommentBlogModel({
			blog_id,
			author_id: userId,
			parent_id:
				!parent_id || parent_id === 'null' || parent_id === ''
					? null
					: parent_id,
			content,
		});
		// Save to database
		const savedComment = await newComment.save();
		return savedComment;
	} catch (error) {
		throw error;
	}
};

// Get comment by Blog ID
const getCommentsByBlogId = async ({ blogId, sort }) => {
	try {
		// sort: 'newest' -> created_at: -1 (Newest first)
		// sort: 'all' (default) -> created_at: 1 (Oldest first - Chronological)
		const sortOption =
			sort === 'newest' ? { created_at: -1 } : { created_at: 1 };
		const comments = await CommentBlogModel.find({ blog_id: blogId })
			.populate('author_id', 'full_name avatar')
			.sort(sortOption)
			.lean();

		const commentMap = {};
		const rootComments = [];

		// Initialize map
		comments.forEach((comment) => {
			comment.children = [];
			commentMap[comment._id] = comment;
		});

		// Link children to parents
		comments.forEach((comment) => {
			if (comment.parent_id) {
				if (commentMap[comment.parent_id]) {
					commentMap[comment.parent_id].children.push(comment);
				}
			} else {
				rootComments.push(comment);
			}
		});

		return { comments: rootComments, total: comments.length };
	} catch (error) {
		throw error;
	}
};

// Update a comment
const updateComment = async ({ id, content }) => {
	try {
		const updatedComment = await CommentBlogModel.findByIdAndUpdate(
			id,
			{ content },
			{ new: true }
		);
		return updatedComment;
	} catch (error) {
		throw error;
	}
};

// Delete a comment
const deleteComment = async ({ id }) => {
	try {
		// Find all direct children
		const children = await CommentBlogModel.find({ parent_id: id });

		// Recursively delete all children
		for (const child of children) {
			await deleteComment({ id: child._id });
		}

		// Delete the comment itself
		const result = await CommentBlogModel.findByIdAndDelete(id);
		return result;
	} catch (error) {
		throw error;
	}
};

export const commentBlogService = {
	getAllComments,
	createComment,
	getCommentsByBlogId,
	updateComment,
	deleteComment,
};
