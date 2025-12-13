import { TypeProductModel } from '@/model/typeProductModel';

// Get all type products
const getAllTypeProducts = async ({ searchName }) => {
	try {
        // Search functionality
        if (searchName) {
            const regex = new RegExp(searchName, 'i'); // Case-insensitive search
            const filteredTypeProducts = await TypeProductModel.find({ name: { $regex: regex } });
            return filteredTypeProducts;
        }
		const typeProducts = await TypeProductModel.find();
		return typeProducts;
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
