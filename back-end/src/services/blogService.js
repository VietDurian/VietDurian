import { KnowledgeBlogModel } from '@/model/knowledgeBlogModel';
import { KnowledgeBlockModel } from '@/model/knowledgeBlockModel';
import { cloudinary } from '@/config/cloudinary.js';

const normalizeText = (text = '') =>
	text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

// Create a new knowledge blog
const createKnowledgeBlog = async ({ author_id, title, content, image }) => {
	try {
		let imageUrl = '';
		if (image) {
			try {
				const result = await cloudinary.uploader.upload(image, {
					folder: 'vietdurian',
				});
				imageUrl = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}

		const newBlog = new KnowledgeBlogModel({
			author_id,
			title,
			content,
			image: imageUrl,
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
		// upload image to cloudinary if image exists
		let imageUrl = '';
		if (image) {
			try {
				const result = await cloudinary.uploader.upload(image, {
					folder: 'vietdurian',
				});
				imageUrl = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}
		const newBlock = new KnowledgeBlockModel({
			blog_id,
			title,
			content,
			image: imageUrl,
		});
		const savedBlock = await newBlock.save();
		return savedBlock;
	} catch (error) {
		throw error;
	}
};

// Get knowledge blogs
const getKnowledgeBlogs = async ({ search, sort, author_id }) => {
	try {
		const query = {};
		const shouldFilterBySearch = Boolean(search);
		const normalizedSearch = normalizeText(search || '');
		if (author_id) {
			query.author_id = author_id;
		}

		let sortOption = {};
		if (sort === 'oldest') {
			sortOption = { created_at: 1 };
		} else {
			sortOption = { created_at: -1 };
		}

		const blogs = await KnowledgeBlogModel.find(query)
			.sort(sortOption)
			.lean()
			.populate('author_id', 'full_name avatar');
		const knowledgeBlogs = await Promise.all(
			blogs.map(async (blog) => {
				const blocks = await KnowledgeBlockModel.find({
					blog_id: blog._id,
				}).lean();
				return { ...blog, knowledgeBlocks: blocks };
			}),
		);

		if (!shouldFilterBySearch) {
			return knowledgeBlogs;
		}

		const filteredBlogs = knowledgeBlogs.filter((blog) => {
			const normalizedTitle = normalizeText(blog.title || '');
			return (
				normalizedTitle.includes(normalizedSearch)
			);
		});

		return filteredBlogs;
	} catch (error) {
		throw error;
	}
};

// Get knowledge blog details
const getKnowledgeBlogDetails = async (blog_id) => {
	try {
		const blog = await KnowledgeBlogModel.findById(blog_id)
			.lean()
			.populate('author_id', 'full_name avatar');
		if (!blog) {
			return null;
		}
		const blocks = await KnowledgeBlockModel.find({
			blog_id: blog._id,
		}).lean();
		return { ...blog, knowledgeBlocks: blocks };
	} catch (error) {
		throw error;
	}
};

// Update knowledge blog
const updateKnowledgeBlog = async (blog_id, { title, content,image, status }) => {
	try {
		const blog = await KnowledgeBlogModel.findById(blog_id);
		if (!blog) {
			throw new Error('Knowledge blog not found');
		}
		if (title) blog.title = title;
		if (content) blog.content = content;
		if (status) blog.status = status;
		await blog.save();
		return blog;
	} catch (error) {
		throw error;
	}
};

// Update knowledge block
const updateKnowledgeBlock = async (block_id, { title, content, image }) => {
	try {
		const block = await KnowledgeBlockModel.findById(block_id);
		if (!block) {
			throw new Error('Knowledge block not found');
		}

		if (title) block.title = title;
		if (content) block.content = content;

		if (image) {
			try {
				const result = await cloudinary.uploader.upload(image, {
					folder: 'vietdurian',
				});
				block.image = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}

		await block.save();
		return block;
	} catch (error) {
		throw error;
	}
};

// Delete knowledge blog
const deleteKnowledgeBlog = async (blog_id) => {
	try {
		const blog = await KnowledgeBlogModel.findById(blog_id);
		if (!blog) {
			throw new Error('Knowledge blog not found');
		}
		// Delete all blocks associated with this blog
		await KnowledgeBlockModel.deleteMany({ blog_id });
		// Delete the blog itself
		await KnowledgeBlogModel.findByIdAndDelete(blog_id);
	} catch (error) {
		throw error;
	}
};

// Delete knowledge block
const deleteKnowledgeBlock = async (block_id) => {
	try {
		const block = await KnowledgeBlockModel.findById(block_id);
		if (!block) {
			throw new Error('Knowledge block not found');
		}
		await KnowledgeBlockModel.findByIdAndDelete(block_id);
	} catch (error) {
		throw error;
	}
};

export const blogService = {
	createKnowledgeBlog,
	createKnowledgeBlock,
	getKnowledgeBlogs,
	updateKnowledgeBlog,
	deleteKnowledgeBlog,
	updateKnowledgeBlock,
	deleteKnowledgeBlock,
	getKnowledgeBlogDetails,
};
