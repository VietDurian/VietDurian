import mongoose from 'mongoose';

const commentBlogSchema = new mongoose.Schema(
	{
		blog_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Blog',
			required: true,
		},
		author_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		parent_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CommentBlog',
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

const CommentBlogModel = mongoose.model('CommentBlog', commentBlogSchema);

export { CommentBlogModel };
