import mongoose from 'mongoose';

const reportCommentSchema = new mongoose.Schema(
	{
		comment_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CommentPost',
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		reason: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ['pending', 'reviewed'],
			default: 'pending',
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const ReportCommentModel = mongoose.model('ReportComment', reportCommentSchema);

export { ReportCommentModel };
