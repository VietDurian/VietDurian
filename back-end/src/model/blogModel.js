import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		author_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true,
		},
		image: {
			type: String,
			default: '',
		},
		status: {
			type: String,
			default: 'active',
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const BlogModel = mongoose.model('Blog', blogSchema);

export { BlogModel };
