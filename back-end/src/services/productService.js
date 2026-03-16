import { Product, ProductImage } from "@/model/productModel.js";
import createError from "http-errors";
import mongoose from "mongoose";
import { TypeProductModel } from "@/model/typeProductModel.js";

// Create a new product
const createProduct = async ({
  seasonDiaryId,
  userId,
  typeId,
  name,
  description,
  price,
  origin,
  weight,
  harvestStartDate,
  harvestEndDate,
  status,
  images,
}) => {
  try {
    // Validate typeId
    if (!mongoose.Types.ObjectId.isValid(typeId)) {
      throw createError(400, "Invalid typeId");
    }
    const typeExists = await TypeProductModel.findById(typeId).lean();
    if (!typeExists) {
      throw createError(404, "TypeProduct not found");
    }

    // Validate price > 0
    const numericPrice = typeof price === "number" ? price : Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      throw createError(400, "price must be a positive number");
    }

    // Validate harvest dates
    const startDate = new Date(harvestStartDate);
    const endDate = new Date(harvestEndDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw createError(400, "Invalid harvest dates");
    }
    if (startDate > endDate) {
      throw createError(400, "harvestStartDate must be before or equal to harvestEndDate");
    }

    const newProduct = new Product({
      user_id: userId,
      type_id: typeId,
      season_diary_id: seasonDiaryId,
      name,
      description,
      price: mongoose.Types.Decimal128.fromString(String(numericPrice)),
      origin,
      weight,
      harvest_start_date: startDate,
      harvest_end_date: endDate,
      status: status ?? "active",
    });

    const savedProduct = await newProduct.save();

    // Add product images if provided
    if (images && images.length > 0) {
      const productImages = await Promise.all(
        images.map((imageUrl) =>
          new ProductImage({
            product_id: savedProduct._id,
            url: imageUrl,
          }).save()
        )
      );

      savedProduct.images = productImages.map((img) => img._id);
      await savedProduct.save();
    }

    return savedProduct;
  } catch (error) {
    throw error;
  }
};

const getAllProducts = async ({
  searchName,
  typeId,
  userId,
  seasonDiaryId,
  status,
  sortBy = "created_at",
  sortOrder = "desc",
  page = 1,
  limit = 10,
}) => {
  try {
    // Build filter
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

    if (status) {
      filter = { ...filter, status };
    }

    if (seasonDiaryId) {
      filter = { ...filter, season_diary_id: seasonDiaryId };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query in parallel
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

    // lấy list productIds
    const productIds = products.map((p) => p._id);

    // lấy toàn bộ images của các product trong page hiện tại
    const images = await ProductImage.find({ product_id: { $in: productIds } })
      .lean();
    console.log('images', images);
    // group images theo product_id
    const imagesByProductId = images.reduce((acc, img) => {
      const key = String(img.product_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {});

    // gán vào từng product
    const productsWithImages = products.map((p) => ({
      ...p,
      images: imagesByProductId[String(p._id)] || [],
    }));
    console.log('productsWithImages', productsWithImages);



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

const getOwnProducts = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createError(400, "Invalid userId");
    }

    const products = await Product.find({ user_id: userId })
      .populate("user_id", "full_name avatar role")
      .populate("type_id", "name")
      .sort({ created_at: -1 })
      .lean();

    if (products.length === 0) {
      return [];
    }

    const productIds = products.map((p) => p._id);
    const images = await ProductImage.find({ product_id: { $in: productIds } })
      .lean();

    const imagesByProductId = images.reduce((acc, img) => {
      const key = String(img.product_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {});

    return products.map((p) => ({
      ...p,
      images: imagesByProductId[String(p._id)] || [],
    }));
  } catch (error) {
    throw error;
  }
};

// Get product by ID with details
const getProductById = async (productId) => {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { view_count: 1 } },
      { new: true }
    )
      .populate("user_id", "full_name avatar email phone")
      .populate("type_id", "name")

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

// Update product
const updateProduct = async (productId, updateData) => {
  try {
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw createError(404, "Product not found");
    }

    const {
      user_id,
      images,
      type_id,
      typeId,
      season_diary_id,
      seasonDiaryId,
      harvest_start_date,
      harvest_end_date,
      harvestStartDate,
      harvestEndDate,
      ...allowedData
    } = updateData;

    const normalizedData = { ...allowedData };

    const resolvedTypeId = typeId || type_id;
    if (resolvedTypeId) {
      if (!mongoose.Types.ObjectId.isValid(resolvedTypeId)) {
        throw createError(400, "Invalid typeId");
      }
      const typeExists = await TypeProductModel.findById(resolvedTypeId).lean();
      if (!typeExists) {
        throw createError(404, "TypeProduct not found");
      }
      normalizedData.type_id = resolvedTypeId;
    }

    const resolvedSeasonDiaryId = seasonDiaryId || season_diary_id;
    if (resolvedSeasonDiaryId) {
      normalizedData.season_diary_id = resolvedSeasonDiaryId;
    }

    const resolvedStartDate = harvestStartDate || harvest_start_date;
    const resolvedEndDate = harvestEndDate || harvest_end_date;

    if (resolvedStartDate) {
      normalizedData.harvest_start_date = new Date(resolvedStartDate);
      if (Number.isNaN(normalizedData.harvest_start_date.getTime())) {
        throw createError(400, "Invalid harvestStartDate");
      }
    }

    if (resolvedEndDate) {
      normalizedData.harvest_end_date = new Date(resolvedEndDate);
      if (Number.isNaN(normalizedData.harvest_end_date.getTime())) {
        throw createError(400, "Invalid harvestEndDate");
      }
    }

    const startToCheck =
      normalizedData.harvest_start_date || existingProduct.harvest_start_date;
    const endToCheck =
      normalizedData.harvest_end_date || existingProduct.harvest_end_date;
    if (startToCheck && endToCheck && startToCheck > endToCheck) {
      throw createError(
        400,
        "harvestStartDate must be before or equal to harvestEndDate"
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      normalizedData,
      { new: true, runValidators: true }
    )
      .populate("user_id", "full_name avatar")
      .populate("type_id", "name")
      .populate("images");

    if (!updatedProduct) {
      throw createError(404, "Product not found");
    }

    // Handle image updates if provided
    if (images && Array.isArray(images)) {
      // Delete old images
      await ProductImage.deleteMany({ product_id: productId });

      // Create new images
      const newImages = await Promise.all(
        images.map((imageUrl) =>
          new ProductImage({
            product_id: productId,
            url: imageUrl,
          }).save()
        )
      );

      updatedProduct.images = newImages.map((img) => img._id);
      await updatedProduct.save();
    }

    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

// Delete product
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      throw createError(404, "Product not found");
    }

    // Delete associated images
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

// Filter products by type and price range
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

    if (typeId) {
      filter.type_id = typeId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
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

// Sort products
const sortProducts = async ({
  sortBy = "created_at",
  sortOrder = "desc",
  page = 1,
  limit = 10,
}) => {
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

export const productService = {
  createProduct,
  getAllProducts,
  getOwnProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
  sortProducts,
};
