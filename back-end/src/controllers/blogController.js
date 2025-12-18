import { blogService } from "@/services/blogService";

// Get all blogs
const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await blogService.getAllBlogs();
        res.status(200).json({
            code: 200,
            message: 'Blogs retrieved successfully',
            data: blogs
        });
    } catch (error) {
        next(error);
    }
}

// Create a new blog
const createBlog = async (req, res, next) => {
    try {
        const { title, content, image } = req.body;
        // Validate input
        if (!title || typeof title !== 'string' || !content || typeof content !== 'string' || (image && typeof image !== 'string')) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid input data'
            });
        }
        const author_id = req.user._id
        const newBlog = await blogService.createBlog({ title, content, author_id, image });
        res.status(201).json({
            code: 201,
            message: 'Blog created successfully',
            data: newBlog
        });
    } catch (error) {
        next(error);
    }
}

export const blogController = {
    getAllBlogs,
    createBlog
};