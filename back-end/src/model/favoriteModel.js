import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'GeneralPost',
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

// Ensure a user can only favorite a post once
favoriteSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

const FavoriteModel = mongoose.model('Favorite', favoriteSchema);

export { FavoriteModel };
