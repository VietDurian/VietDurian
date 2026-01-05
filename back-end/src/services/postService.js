import { GeneralPostModel } from '@/model/generalPostModel';
import { cloudinary } from '@/config/cloudinary';
import { notificationService } from '@/services/notificationService';

// Create a new general post
const createGeneralPost = async ({
	author_id,
	category,
	content,
	image,
	contact,
}) => {
	try {
		let imageUrl = '';
		if (image) {
			try {
				const result = await cloudinary.uploader.upload(image, {
					folder: 'vietdurian',
				});
				imageUrl = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}

		const newPost = new GeneralPostModel({
			author_id,
			category,
			content,
			image: imageUrl,
			contact,
		});
		const savedPost = await newPost.save();
		return savedPost;
	} catch (error) {
		throw error;
	}
};

// Get general posts
const getGeneralPost = async ({ status, category, search, author_id }) => {
	try {
		const query = {};

		if (status) {
			query.status = status;
		}

		if (category) {
			query.category = category;
		}

		if (search) {
			query.content = { $regex: search, $options: 'i' };
		}

		if (author_id) {
			query.author_id = author_id;
		}

		const posts = await GeneralPostModel.find(query).lean();
		return posts;
	} catch (error) {
		throw error;
	}
};

// Update a general post
const updateGeneralPost = async (post_id, data) => {
	try {
		if (data.image) {
			try {
				const result = await cloudinary.uploader.upload(data.image, {
					folder: 'vietdurian',
				});
				data.image = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}

		const updatedPost = await GeneralPostModel.findByIdAndUpdate(
			post_id,
			data,
			{ new: true }
		);
		return updatedPost;
	} catch (error) {
		throw error;
	}
};

// Delete a general post
const deleteGeneralPost = async (post_id) => {
	try {
		await GeneralPostModel.findByIdAndDelete(post_id);
	} catch (error) {
		throw error;
	}
};

// Approve a general post
const approveGeneralPost = async (post_id, adminId) => {
	try {
		const updatedPost = await GeneralPostModel.findByIdAndUpdate(
			post_id,
			{ status: 'active' },
			{ new: true }
		);

		// Notification Logic
		if (updatedPost) {
			try {
				const receiver_id = updatedPost.author_id;
				if (receiver_id && receiver_id.toString() !== adminId.toString()) {
					await notificationService.createNotification({
						receiver_id: receiver_id,
						sender_id: adminId,
						entity_type: 'post_approval',
						post_id: post_id,
						message: `Your post has been approved by admin.`,
					});
				}
			} catch (error) {
				console.error('Notification error:', error);
			}
		}

		return updatedPost;
	} catch (error) {
		throw error;
	}
};

// Get general post details
const getGeneralPostDetails = async (post_id) => {
	try {
		const post = await GeneralPostModel.findById(post_id).lean();
		return post;
	} catch (error) {
		throw error;
	}
};

export const postService = {
	createGeneralPost,
	getGeneralPost,
	updateGeneralPost,
	deleteGeneralPost,
	approveGeneralPost,
	getGeneralPostDetails,
};
