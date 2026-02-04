import { FavoriteModel } from '@/model/favoriteModel';
import { GeneralPostModel } from '@/model/generalPostModel';
import createError from 'http-errors';

const addToFavorites = async (user_id, post_id) => {
	if (!post_id) {
		throw createError(400, 'Post ID is required');
	}

	const post = await GeneralPostModel.findById(post_id);
	if (!post) {
		throw createError(404, 'Post not found');
	}

	const existingFavorite = await FavoriteModel.findOne({ user_id, post_id });
	if (existingFavorite) {
		throw createError(400, 'Post already in favorites');
	}

	const newFavorite = new FavoriteModel({
		user_id,
		post_id,
	});

	await newFavorite.save();
	return newFavorite;
};

const deleteFromFavorites = async (user_id, post_id) => {
	if (!post_id) {
		throw createError(400, 'Post ID is required');
	}

	const deletedFavorite = await FavoriteModel.findOneAndDelete({
		user_id,
		post_id,
	});

	if (!deletedFavorite) {
		throw createError(404, 'Favorite not found');
	}

	return deletedFavorite;
};

const viewFavorites = async (user_id) => {
	const favorites = await FavoriteModel.find({ user_id })
		.populate('post_id')
		.populate('user_id', 'full_name email avatar')
		.sort({ created_at: -1 });
	return favorites;
};

export const favoriteService = {
	addToFavorites,
	deleteFromFavorites,
	viewFavorites,
};
