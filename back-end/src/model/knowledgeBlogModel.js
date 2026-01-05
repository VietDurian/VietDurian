import mongoose from 'mongoose';

const KnowledgeBlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
		},
		author_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ['progressing', 'active', 'inactive'],
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

const KnowledgeBlogModel = mongoose.model('KnowledgeBlog', KnowledgeBlogSchema);

export { KnowledgeBlogModel };