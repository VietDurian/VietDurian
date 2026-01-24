import { Product, ProductImage } from "@/model/productModel.js";
import createError from "http-errors";

const getAllProducts = async ({
    searchName,
    typeId,
    userId,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
}) => {
    try {
        let filter = {};

        if (searchName) {
            const regex = new RegExp(searchName, "i");
            filter = { ...filter, name: { $regex: regex } };
        }

        if (typeId) {
            filter = { ...filter, type_id: typeId };
        }

        if (userId) {
            filter = { ...filter, user_id: userId };
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const sortObj = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("user_id", "full_name avatar")
                .populate("type_id", "name")
                .skip(skip)
                .limit(limitNumber)
                .sort(sortObj)
                .lean(),
            Product.countDocuments(filter),
        ]);

        const productIds = products.map((p) => p._id);
        const images = await ProductImage.find({ product_id: { $in: productIds } }).lean();

        const imagesByProductId = images.reduce((acc, img) => {
            const key = String(img.product_id);
            if (!acc[key]) acc[key] = [];
            acc[key].push(img);
            return acc;
        }, {});

        const productsWithImages = products.map((p) => ({
            ...p,
            images: imagesByProductId[String(p._id)] || [],
        }));

        return {
            data: productsWithImages,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limitNumber),
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
            },
        };
    } catch (error) {
        throw error;
    }
};

// Admin: Get product by ID (increments view_count)
const getProductById = async (productId) => {
    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            { $inc: { view_count: 1 } },
            { new: true }
        )
            .populate("user_id", "full_name avatar email phone")
            .populate("type_id", "name");

        const listImage = await ProductImage.find({ product_id: productId });
        product.images = listImage;

        if (!product) {
            throw createError(404, "Product not found");
        }

        return product;
    } catch (error) {
        throw error;
    }
};

const deleteProduct = async (productId) => {
    try {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            throw createError(404, "Product not found");
        }
        await ProductImage.deleteMany({ product_id: productId });
        return product;
    } catch (error) {
        throw error;
    }
};

const searchProducts = async ({ keyword, page = 1, limit = 10 }) => {
    try {
        const regex = new RegExp(keyword, "i");
        const filter = {
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                { origin: { $regex: regex } },
            ],
        };

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("user_id", "full_name avatar")
                .populate("type_id", "name")
                .populate("images")
                .skip(skip)
                .limit(limitNumber)
                .sort({ created_at: -1 }),
            Product.countDocuments(filter),
        ]);

        return {
            data: products,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limitNumber),
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
            },
        };
    } catch (error) {
        throw error;
    }
};

const filterProducts = async ({
    typeId,
    minPrice,
    maxPrice,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
}) => {
    try {
        let filter = {};

        if (typeId) filter.type_id = typeId;

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = minPrice;
            if (maxPrice !== undefined) filter.price.$lte = maxPrice;
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const sortObj = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("user_id", "full_name avatar")
                .populate("type_id", "name")
                .populate("images")
                .skip(skip)
                .limit(limitNumber)
                .sort(sortObj),
            Product.countDocuments(filter),
        ]);

        return {
            data: products,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limitNumber),
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
            },
        };
    } catch (error) {
        throw error;
    }
};

const sortProducts = async ({ sortBy = "created_at", sortOrder = "desc", page = 1, limit = 10 }) => {
    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const sortObj = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const [products, total] = await Promise.all([
            Product.find()
                .populate("user_id", "full_name avatar")
                .populate("type_id", "name")
                .populate("images")
                .skip(skip)
                .limit(limitNumber)
                .sort(sortObj),
            Product.countDocuments(),
        ]);

        return {
            data: products,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limitNumber),
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
            },
        };
    } catch (error) {
        throw error;
    }
};

export const productAdminService = {
    getAllProducts,
    getProductById,
    deleteProduct,
    searchProducts,
    filterProducts,
    sortProducts,
};
