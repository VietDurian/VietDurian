import mongoose from 'mongoose';

const reportPostSchema = new mongoose.Schema(
	{
		post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'GeneralPost',
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
        image: {
            type: String,
            default: '',
        },
		status: {
			type: String,
			enum: ['Pending', 'Resolved'],
			default: 'Pending',
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const ReportPostModel = mongoose.model(
	'ReportPost',
	reportPostSchema
);

export { ReportPostModel };