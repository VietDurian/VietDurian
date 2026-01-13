import { postService } from '@/services/postService';

// Get blogs general
const getGeneralPost = async (req, res, next) => {
	try {
		const { status, category, search, sort, author_id } = req.query;
		const posts = await postService.getGeneralPost({
			status,
			category,
			search,
			sort,
			author_id,
		});
		res.status(200).json({
			code: 200,
			message: 'General blogs retrieved successfully',
			data: posts,
		});
	} catch (error) {
		next(error);
	}
};

// Create a new general post
const createGeneralPost = async (req, res, next) => {
	try {
		const { category, content, image, contact } = req.body;
		// Validate input
		if (!category || !content || !contact) {
			return res.status(400).json({
				code: 400,
				message: 'Category, content, and contact are required',
			});
		}
		const author_id = req.user.id;
		const newGeneralPost = await postService.createGeneralPost({
			author_id,
			category,
			content,
			image,
			contact,
		});
		res.status(201).json({
			code: 201,
			message: 'General post created successfully',
			data: newGeneralPost,
		});
	} catch (error) {
		next(error);
	}
};

// Update a general post
const updateGeneralPost = async (req, res, next) => {
	try {
		const { post_id } = req.params;
		const { category, content, image, contact } = req.body;
		const updatedPost = await postService.updateGeneralPost(post_id, {
			category,
			content,
			image,
			contact,
		});
		res.status(200).json({
			code: 200,
			message: 'General blog updated successfully',
			data: updatedPost,
		});
	} catch (error) {
		next(error);
	}
};

// Delete a general post
const deleteGeneralPost = async (req, res, next) => {
	try {
		const { post_id } = req.params;
		await postService.deleteGeneralPost(post_id);
		res.status(200).json({
			code: 200,
			message: 'General blog deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

// Approve a general post
const approveGeneralPost = async (req, res, next) => {
	try {
		const { post_id } = req.params;
		const adminId = req.user._id;
		const updatedPost = await postService.approveGeneralPost(post_id, adminId);

		res.status(200).json({
			code: 200,
			message: 'General blog approved successfully',
			data: updatedPost,
		});
	} catch (error) {
		next(error);
	}
};

// Get general post details
const getGeneralPostDetails = async (req, res, next) => {
	try {
		const { post_id } = req.params;
		const post = await postService.getGeneralPostDetails(post_id);
		if (!post) {
			return res.status(404).json({
				code: 404,
				message: 'General blog not found',
			});
		}
		res.status(200).json({
			code: 200,
			message: 'General blog details retrieved successfully',
			data: post,
		});
	} catch (error) {
		next(error);
	}
};

export const postController = {
	getGeneralPost,
	createGeneralPost,
	updateGeneralPost,
	deleteGeneralPost,
	approveGeneralPost,
	getGeneralPostDetails,
};
