import mongoose from 'mongoose';

const reactionCommentSchema = new mongoose.Schema(
	{
		comment_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CommentBlog',
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry'],
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

const ReactionCommentModel = mongoose.model(
	'ReactionComment',
	reactionCommentSchema
);

export { ReactionCommentModel };
