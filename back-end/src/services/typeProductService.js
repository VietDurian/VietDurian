import { TypeProductModel } from '@/model/typeProductModel';

// Get all type products
const getAllTypeProducts = async ({ searchName, page = 1, limit = 10 }) => {
	try {
        // 1. Xây dựng filter (bộ lọc)
        let filter = {};
        if (searchName) {
            const regex = new RegExp(searchName, 'i');
            filter = { name: { $regex: regex } };
        }

        // 2. Tính toán phân trang
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // 3. Thực hiện query song song (lấy data và đếm tổng)
        const [typeProducts, total] = await Promise.all([
            TypeProductModel.find(filter)
                .skip(skip)
                .limit(limitNumber)
                .sort({ created_at: -1 }), // Sắp xếp mới nhất lên đầu (tùy chọn)
            TypeProductModel.countDocuments(filter)
        ]);

        // 4. Trả về kết quả kèm thông tin phân trang
        return {
            data: typeProducts,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limitNumber),
                currentPage: pageNumber,
                itemsPerPage: limitNumber
            }
        };
	} catch (error) {
		throw error;
	}
};

// Create a new type product
const createTypeProduct = async ({ name }) => {
	try {
        // Create a new TypeProduct instance
		const newTypeProduct = new TypeProductModel({ name });

        // Save to database
		const savedTypeProduct = await newTypeProduct.save();
		return savedTypeProduct;
	} catch (error) {
		throw error;
	}
};

// Update a type product
const updateTypeProduct = async ({ id, name }) => {
    try {
        const updatedTypeProduct = await TypeProductModel.findByIdAndUpdate(
            id,
            { name },
            { new: true } // Return the updated document
        );
        return updatedTypeProduct;
    } catch (error) {
        throw error;
    }
};

// Delete a type product
const deleteTypeProduct = async ({ id }) => {
    try {
        await TypeProductModel.findByIdAndDelete(id);
    } catch (error) {
        throw error;
    }
};

export const typeProductService = {
	getAllTypeProducts,
    createTypeProduct,
    updateTypeProduct,
    deleteTypeProduct,
};
