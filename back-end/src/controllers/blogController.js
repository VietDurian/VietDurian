import { blogService } from '@/services/blogService';

// Get blogs knownledge
const getKnowledgeBlogs = async (req, res, next) => {
	try {
		const { search, sort, author_id } = req.query;
		const blogs = await blogService.getKnowledgeBlogs({
			search,
			sort,
			author_id,
		});
		res.status(200).json({
			code: 200,
			message: 'Knowledge blogs retrieved successfully',
			data: blogs,
		});
	} catch (error) {
		next(error);
	}
};

// Get knowledge blog details
const getKnowledgeBlogDetails = async (req, res, next) => {
	try {
		const { blog_id } = req.params;
		const blog = await blogService.getKnowledgeBlogDetails(blog_id);
		if (!blog) {
			return res.status(404).json({
				code: 404,
				message: 'Knowledge blog not found',
			});
		}
		res.status(200).json({
			code: 200,
			message: 'Knowledge blog details retrieved successfully',
			data: blog,
		});
	} catch (error) {
		next(error);
	}
};

// Create a new knowledge blog
const createKnowledgeBlog = async (req, res, next) => {
	try {
		const { title, content, knowledgeBlocks } = req.body;

		// Validate input
		if (!title || !content) {
			return res.status(400).json({
				code: 400,
				message: 'Title and content are required',
			});
		}

		if (knowledgeBlocks) {
			if (!Array.isArray(knowledgeBlocks)) {
				return res.status(400).json({
					code: 400,
					message: 'Knowledge blocks must be an array',
				});
			}
			// Validate all blocks before creating anything
			for (const block of knowledgeBlocks) {
				if (!block.title || !block.content) {
					return res.status(400).json({
						code: 400,
						message: 'Each knowledge block must have title and content',
					});
				}
			}
		}

		const author_id = req.user.id;

		// 1. Create parent blog
		const newBlog = await blogService.createKnowledgeBlog({
			author_id,
			title,
			content,
		});

		// 2. Create blocks if exist
		const createdBlocks = [];
		if (knowledgeBlocks && knowledgeBlocks.length > 0) {
			for (const block of knowledgeBlocks) {
				const newBlock = await blogService.createKnowledgeBlock({
					blog_id: newBlog.id,
					title: block.title,
					content: block.content,
					image: block.image,
				});
				createdBlocks.push(newBlock);
			}
		}

		res.status(201).json({
			code: 201,
			message: 'Knowledge blog created successfully',
			data: {
				...newBlog._doc,
				knowledgeBlocks: createdBlocks,
			},
		});
	} catch (error) {
		next(error);
	}
};

// Create knowledge block
const createKnowledgeBlock = async (req, res, next) => {
	try {
		const { blog_id } = req.params;
		const { title, content, image } = req.body;

		if (!title || !content) {
			return res.status(400).json({
				code: 400,
				message: 'Title and content are required',
			});
		}

		const newBlock = await blogService.createKnowledgeBlock({
			blog_id,
			title,
			content,
			image,
		});
		res.status(201).json({
			code: 201,
			message: 'Knowledge block created successfully',
			data: newBlock,
		});
	} catch (error) {
		next(error);
	}
};

// Update knowledge blog
const updateKnowledgeBlog = async (req, res, next) => {
	try {
		const { blog_id } = req.params;
		const { title, content, status } = req.body;
		const updatedBlog = await blogService.updateKnowledgeBlog(blog_id, {
			title,
			content,
			status,
		});
		res.status(200).json({
			code: 200,
			message: 'Knowledge blog updated successfully',
			data: updatedBlog,
		});
	} catch (error) {
		next(error);
	}
};

// Update knowledge block
const updateKnowledgeBlock = async (req, res, next) => {
	try {
		const { block_id } = req.params;
		const { title, content, image } = req.body;
		await blogService.updateKnowledgeBlock(block_id, {
			title,
			content,
			image,
		});
		res.status(200).json({
			code: 200,
			message: 'Knowledge block updated successfully',
		});
	} catch (error) {
		next(error);
	}
};

// Delete knowledge blog
const deleteKnowledgeBlog = async (req, res, next) => {
	try {
		const { blog_id } = req.params;
		await blogService.deleteKnowledgeBlog(blog_id);
		res.status(200).json({
			code: 200,
			message: 'Knowledge blog deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

// Delete knowledge block
const deleteKnowledgeBlock = async (req, res, next) => {
	try {
		const { block_id } = req.params;
		await blogService.deleteKnowledgeBlock(block_id);
		res.status(200).json({
			code: 200,
			message: 'Knowledge block deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

export const blogController = {
	getKnowledgeBlogs,
	createKnowledgeBlog,
	createKnowledgeBlock,
	updateKnowledgeBlog,
	deleteKnowledgeBlog,
	updateKnowledgeBlock,
	deleteKnowledgeBlock,
	getKnowledgeBlogDetails,
};
