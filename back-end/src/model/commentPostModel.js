import mongoose from 'mongoose';

const commentPostSchema = new mongoose.Schema(
	{
		post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'GeneralPost',
			required: true,
		},
		author_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		parent_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CommentPost',
			default: null,
		},
		content: {
			type: String,
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

const CommentPostModel = mongoose.model('CommentPost', commentPostSchema);

export { CommentPostModel };