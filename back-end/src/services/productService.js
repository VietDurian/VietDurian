import { Product, ProductImage } from "@/model/productModel.js";
import createError from "http-errors";

// Create a new product
const createProduct = async ({
  userId,
  typeId,
  name,
  description,
  price,
  discount,
  stock,
  origin,
  weight,
  images,
}) => {
  try {
    const newProduct = new Product({
      user_id: userId,
      type_id: typeId,
      name,
      description,
      price,
      discount: discount || 0,
      stock,
      origin,
      weight,
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

// Get all products with search, filter, sort, and pagination
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
    // Prevent updating user_id and type_id directly
    const { user_id, type_id, images, ...allowedData } = updateData;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      allowedData,
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
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
  sortProducts,
};
