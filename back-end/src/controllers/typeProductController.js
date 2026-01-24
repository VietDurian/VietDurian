import { typeProductService } from '@/services/typeProductService.js';

// Get all type products
const getAllTypeProducts = async (req, res, next) => {
	try {
		// Search for type products
		const { name, page, limit } = req.query;
		const typeProducts = await typeProductService.getAllTypeProducts({
			searchName: name,
			page: page || 1,
			limit: limit || 10
		});
		res.status(200).json({
			code: 200,
			message: 'Type products retrieved successfully',
			data: typeProducts.data,
			pagination: typeProducts.pagination
		});
	} catch (error) {
		next(error);
	}
};

// Create a new type product
const createTypeProduct = async (req, res, next) => {
	try {
		const { name, description } = req.body;

		// check if name is provided
		if (
			!name ||
			name.empty ||
			typeof name !== 'string' ||
			!description ||
			typeof description !== 'string'
		) {
			return res.status(400).json({
				code: 400,
				message: 'Invalid type product name or description',
			});
		}
		const newTypeProduct = await typeProductService.createTypeProduct({
			name,
			description,
		});
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
		const { id } = req.params;
		const { name, description } = req.body;

		// Validate input
		if (
			!id ||
			typeof id !== 'string' ||
			!name ||
			typeof name !== 'string' ||
			!description ||
			typeof description !== 'string'
		) {
			return res.status(400).json({
				code: 400,
				message: 'Invalid input data',
			});
		}
		const updatedTypeProduct = await typeProductService.updateTypeProduct({
			id,
			name,
			description,
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
		const { id } = req.params;
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
