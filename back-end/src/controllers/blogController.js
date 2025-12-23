import { blogService } from '@/services/blogService';

// Get blogs knownledge
const getKnowledgeBlogs = async (req, res, next) => {
	try {
		const blogs = await blogService.getKnowledgeBlogs();
		res.status(200).json({
			code: 200,
			message: 'Knowledge blogs retrieved successfully',
			data: blogs,
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

		if (knowledgeBlocks && !Array.isArray(knowledgeBlocks)) {
			return res.status(400).json({
				code: 400,
				message: 'Knowledge blocks must be an array',
			});
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
				if (!block.title || !block.content) {
					return res.status(400).json({
						code: 400,
						message: 'Each knowledge block must have title and content',
					});
				}
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
				...newBlog,
				knowledgeBlocks: createdBlocks,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const blogController = {
	getKnowledgeBlogs,
	createKnowledgeBlog,
};
