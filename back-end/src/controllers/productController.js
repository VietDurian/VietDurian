// Vo Lam Thuy Vi
import { productService } from "@/services/productService.js";
import createError from "http-errors";

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      stock,
      origin,
      weight,
      typeId,
      images,
    } = req.body;
    const userId = req.user?.id || req.user?._id;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !origin ||
      !weight ||
      !typeId
    ) {
      throw createError(
        400,
        "Missing required fields: name, description, price, stock, origin, weight, typeId"
      );
    }

    if (!userId) {
      throw createError(401, "User not authenticated");
    }

    const newProduct = await productService.createProduct({
      userId,
      typeId,
      name,
      description,
      price,
      discount: discount || 0,
      stock,
      origin,
      weight,
      images: images || [],
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products with pagination, search, filter, and sort
const getAllProducts = async (req, res, next) => {
  try {
    const { name, typeId, sortBy, sortOrder, page, limit } = req.query;

    const products = await productService.getAllProducts({
      searchName: name,
      typeId,
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Products retrieved successfully",
      data: products.data,
      pagination: products.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get product detail by ID
const getProductDetail = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    const product = await productService.getProductById(productId);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    if (!userId) {
      throw createError(401, "User not authenticated");
    }

    // Validate update data - prevent empty updates
    if (Object.keys(updateData).length === 0) {
      throw createError(400, "No fields provided for update");
    }

    const updatedProduct = await productService.updateProduct(
      productId,
      updateData
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    if (!userId) {
      throw createError(401, "User not authenticated");
    }

    await productService.deleteProduct(productId);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Search products
const searchProducts = async (req, res, next) => {
  try {
    const { keyword, page, limit } = req.query;

    if (!keyword) {
      throw createError(400, "Search keyword is required");
    }

    const results = await productService.searchProducts({
      keyword,
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Products searched successfully",
      data: results.data,
      pagination: results.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Filter products
const filterProducts = async (req, res, next) => {
  try {
    const { typeId, minPrice, maxPrice, sortBy, sortOrder, page, limit } =
      req.query;

    const results = await productService.filterProducts({
      typeId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Products filtered successfully",
      data: results.data,
      pagination: results.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Sort products
const sortProducts = async (req, res, next) => {
  try {
    const { sortBy, sortOrder, page, limit } = req.query;

    const results = await productService.sortProducts({
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Products sorted successfully",
      data: results.data,
      pagination: results.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const productController = {
  createProduct,
  getAllProducts,
  getProductDetail,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
  sortProducts,
};
