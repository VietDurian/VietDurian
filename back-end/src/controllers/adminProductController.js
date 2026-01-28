// Admin Product Dashboard Controller
import { productAdminService } from "@/services/productAdminService.js";

const adminGetAllProducts = async (req, res, next) => {
    try {
        const { name, typeId, sortBy, sortOrder, page, limit, userId } = req.query;

        const results = await productAdminService.getAllProducts({
            searchName: name,
            typeId,
            userId,
            sortBy: sortBy || "created_at",
            sortOrder: sortOrder || "desc",
            page: page || 1,
            limit: limit || 10,
        });

        res.status(200).json({
            success: true,
            data: results.data,
            pagination: results.pagination,
        });
    } catch (error) {
        next(error);
    }
};

const adminGetProductDetail = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await productAdminService.getProductById(productId);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

const adminDeleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const productDeleted = await productAdminService.deleteProduct(productId);
        res.status(200).json({ success: true, data: productDeleted });
    } catch (error) {
        next(error);
    }
};

const adminSearchProducts = async (req, res, next) => {
    try {
        const { keyword, page, limit } = req.query;
        if (!keyword) {
            return res.status(400).json({ success: false, message: "keyword is required" });
        }
        const results = await productAdminService.searchProducts({
            keyword,
            page: page || 1,
            limit: limit || 10,
        });
        res.status(200).json({ success: true, data: results.data, pagination: results.pagination });
    } catch (error) {
        next(error);
    }
};

const adminFilterProducts = async (req, res, next) => {
    try {
        const { typeId, minPrice, maxPrice, sortBy, sortOrder, page, limit } = req.query;
        const results = await productAdminService.filterProducts({
            typeId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sortBy: sortBy || "created_at",
            sortOrder: sortOrder || "desc",
            page: page || 1,
            limit: limit || 10,
        });
        res.status(200).json({ success: true, data: results.data, pagination: results.pagination });
    } catch (error) {
        next(error);
    }
};

const adminSortProducts = async (req, res, next) => {
    try {
        const { sortBy, sortOrder, page, limit } = req.query;
        const results = await productAdminService.sortProducts({
            sortBy: sortBy || "created_at",
            sortOrder: sortOrder || "desc",
            page: page || 1,
            limit: limit || 10,
        });
        res.status(200).json({ success: true, data: results.data, pagination: results.pagination });
    } catch (error) {
        next(error);
    }
};

export const adminProductController = {
    adminGetAllProducts,
    adminGetProductDetail,
    adminDeleteProduct,
    adminSearchProducts,
    adminFilterProducts,
    adminSortProducts,
};
