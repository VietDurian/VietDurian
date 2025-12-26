import { favoriteService } from '@/services/favoriteService';

const addToFavorites = async (req, res, next) => {
	try {
		const { post_id } = req.body;
		const user_id = req.user._id;

		const newFavorite = await favoriteService.addToFavorites(user_id, post_id);

		res.status(201).json({
			success: true,
			message: 'Added to favorites successfully',
			data: newFavorite,
		});
	} catch (error) {
		next(error);
	}
};

const deleteFromFavorites = async (req, res, next) => {
	try {
		const { post_id } = req.params;
		const user_id = req.user._id;

		await favoriteService.deleteFromFavorites(user_id, post_id);

		res.status(200).json({
			success: true,
			message: 'Removed from favorites successfully',
		});
	} catch (error) {
		next(error);
	}
};

const viewFavorites = async (req, res, next) => {
	try {
		const user_id = req.user._id;

		const favorites = await favoriteService.viewFavorites(user_id);

		res.status(200).json({
			success: true,
			message: 'Retrieved favorites successfully',
			data: favorites,
		});
	} catch (error) {
		next(error);
	}
};

export const favoriteController = {
	addToFavorites,
	deleteFromFavorites,
	viewFavorites,
};
