import { typeProductService } from '@/services/typeProductService.js';

// Get all type products
const getAllTypeProducts = async (req, res, next) => {
	try {
		// Search for type products
		const { name } = req.query;
		const typeProducts = await typeProductService.getAllTypeProducts({
			searchName: name,
		});
		res.status(200).json(typeProducts);
	} catch (error) {
		next(error);
	}
};

// Create a new type product
const createTypeProduct = async (req, res, next) => {
	try {
		const { name } = req.body;

		// check if name is provided
		if (!name || name.empty || typeof name !== 'string') {
			return res.status(400).json({
				code: 400,
				message: 'Invalid type product name',
			});
		}
		const newTypeProduct = await typeProductService.createTypeProduct({ name });
		res.status(201).json({
			code: 201,
			message: 'Type product created successfully',
			data: newTypeProduct,
		});
	} catch (error) {
		next(error);
	}
};

// Update a type product
const updateTypeProduct = async (req, res, next) => {
	try {
		const { id, name } = req.body;

		// Validate input
		if (!id || typeof id !== 'string' || !name || typeof name !== 'string') {
			return res.status(400).json({
				code: 400,
				message: 'Invalid input data',
			});
		}
		const updatedTypeProduct = await typeProductService.updateTypeProduct({
			id,
			name,
		});
		res.status(200).json({
			code: 200,
			message: 'Type product updated successfully',
			data: updatedTypeProduct,
		});
	} catch (error) {
		next(error);
	}
};

// Delete a type product
const deleteTypeProduct = async (req, res, next) => {
	try {
		const { id } = req.body;
		// Validate input
		if (!id || typeof id !== 'string') {
			return res.status(400).json({
				code: 400,
				message: 'Invalid type product ID',
			});
		}
		await typeProductService.deleteTypeProduct({ id });
		res.status(200).json({
			code: 200,
			message: 'Type product deleted successfully',
		});
	} catch (error) {
		next(error);
	}
};

export const typeProductController = {
	getAllTypeProducts,
	createTypeProduct,
	updateTypeProduct,
	deleteTypeProduct,
};
