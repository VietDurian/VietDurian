import mongoose from 'mongoose';

const reportBlogSchema = new mongoose.Schema(
	{
		blog_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Blog',
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

const ReportBlogModel = mongoose.model(
	'ReportBlog',
	reportBlogSchema
);

export { ReportBlogModel };
