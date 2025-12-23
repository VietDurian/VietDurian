import { GeneralPostModel } from '@/model/generalPostModel';

// Create a new general post
const createGeneralPost = async ({
	author_id,
	category,
	content,
	image,
	contact,
}) => {
	try {
		const newPost = new GeneralPostModel({
			author_id,
			category,
			content,
			image,
			contact,
		});
		const savedPost = await newPost.save();
		return savedPost;
	} catch (error) {
		throw error;
	}
};

// Get general posts
const getGeneralPost = async ({ status, category, search }) => {
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

		const posts = await GeneralPostModel.find(query).lean();
		return posts;
	} catch (error) {
		throw error;
	}
};

// Update a general post
const updateGeneralPost = async (post_id, data) => {
	try {
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
const approveGeneralPost = async (post_id) => {
    try {
        const updatedPost = await GeneralPostModel.findByIdAndUpdate(
            post_id,
            { status: 'active' },
            { new: true }
        );
        return updatedPost;
    } catch (error) {
        throw error;
    }
}

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
    getGeneralPostDetails
};
