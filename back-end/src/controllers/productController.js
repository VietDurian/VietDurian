// Vo Lam Thuy Vi
import { productService } from "@/services/productService.js";

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const {
      diaryId,
      name,
      description,
      price,
      origin,
      weight,
      typeId,
      harvestStartDate,
      harvestEndDate,
      status,
      images,
    } = req.body;
    const userId = req.user?.id || req.user?._id;

    // Validate required fields
    if (
      !diaryId ||
      !name ||
      !description ||
      !price ||
      !origin ||
      !weight ||
      !typeId ||
      !harvestStartDate ||
      !harvestEndDate ||
      !status
    ) {
      return res.status(400).json({
        code: 400,
        message:
          "Missing required fields: name, description, price, origin, weight, typeId, harvestStartDate, harvestEndDate, status",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    const newProduct = await productService.createProduct({
      userId,
      typeId,
      diaryId,
      name,
      description,
      price,
      origin,
      weight,
      harvestStartDate,
      harvestEndDate,
      status,
      images: images || [],
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Tạo sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products with pagination, search, filter, and sort
const getAllProducts = async (req, res, next) => {
  try {
    const {
      name,
      typeId,
      diaryId,
      sortBy,
      sortOrder,
      page,
      limit,
      status,
      userId: userIdQuery,
    } = req.query;

    // Allow filtering by authenticated user or explicit query param
    const authUserId = req.user?.id || req.user?._id;
    const userId = userIdQuery || authUserId;

    const products = await productService.getAllProducts({
      searchName: name,
      typeId,
      userId,
      diaryId,
      status,
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "desc",
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Sản phẩm được truy xuất thành công",
      data: products.data,
      pagination: products.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getOwnProducts = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ code: 401, message: "User not authenticated" });
    }

    const products = await productService.getOwnProducts(userId);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Sản phẩm của bạn được truy xuất thành công",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// Get product detail by ID
const getProductDetail = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        code: 400,
        message: "Product ID is required",
      });
    }

    const product = await productService.getProductById(productId);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Sản phẩm được truy xuất thành công",
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
      return res.status(400).json({
        code: 400,
        message: "Product ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    // Validate update data - prevent empty updates
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        code: 400,
        message: "No fields provided for update",
      });
    }

    const updatedProduct = await productService.updateProduct(
      productId,
      updateData
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "Cập nhật sản phẩm thành công",
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
      return res.status(400).json({
        code: 400,
        message: "Product ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    await productService.deleteProduct(productId);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Xóa sản phẩm thành công",
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
      return res.status(400).json({
        code: 400,
        message: "Search keyword is required",
      });
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
  getOwnProducts,
  getProductDetail,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
  sortProducts,
};
