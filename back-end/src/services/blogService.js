import { KnowledgeBlogModel } from '@/model/knowledgeBlogModel';
import { KnowledgeBlockModel } from '@/model/knowledgeBlockModel';

// Create a new knowledge blog
const createKnowledgeBlog = async ({ author_id, title, content }) => {
	try {
		const newBlog = new KnowledgeBlogModel({
			author_id,
			title,
			content,
		});
		const savedBlog = await newBlog.save();
		return savedBlog;
	} catch (error) {
		throw error;
	}
};

// Create a new knowledge block
const createKnowledgeBlock = async ({ blog_id, title, content, image }) => {
	try {
		const newBlock = new KnowledgeBlockModel({
			blog_id,
			title,
			content,
			image,
		});
		const savedBlock = await newBlock.save();
		return savedBlock;
	} catch (error) {
		throw error;
	}
};

// Delete a blog by id
const deleteBlog = async (blog_id) => {
	try {
		await BlogModel.findByIdAndDelete(blog_id);
	} catch (error) {
		throw error;
	}
};

// Get knowledge blogs
const getKnowledgeBlogs = async () => {
	try {
		const blogs = await KnowledgeBlogModel.find().lean();
		const knowledgeBlogs = await Promise.all(
			blogs.map(async (blog) => {
				const blocks = await KnowledgeBlockModel.find({
					blog_id: blog._id,
				}).lean();
				return { ...blog, knowledgeBlocks: blocks };
			})
		);
		return knowledgeBlogs;
	} catch (error) {
		throw error;
	}
};

export const blogService = {
	createKnowledgeBlog,
	createKnowledgeBlock,
	deleteBlog,
	getKnowledgeBlogs,
};
