import { BlogModel } from "@/model/blogModel";

// Get all blogs
const getAllBlogs = async () => {
    try {
        const blogs = await BlogModel.find().lean();
        return blogs;
    } catch (error) {
        throw error;
    }
}

// Create a new blog
const createBlog = async ({ title, content, author_id, image }) => {
    try {
        const newBlog = new BlogModel({ title, content, author_id, image });
        const savedBlog = await newBlog.save();
        return savedBlog;
    } catch (error) {
        throw error;
    }
}

export const blogService = {
    getAllBlogs,
    createBlog,
};