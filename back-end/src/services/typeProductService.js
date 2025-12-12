import { typeProductModel } from '@/models/typeProductModel';

// Get all type products
const getAllTypeProducts = async (req, res, next) => {
    try {
        const typeProducts = await typeProductModel.find();
    } catch (error) {
        next(error);
    }
}

export const typeProductService = {
    getAllTypeProducts,
};