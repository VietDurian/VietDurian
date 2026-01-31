import { GardenModel } from '../model/gardenModel.js';
import createError from 'http-errors';
import { cloudinary } from '@/config/cloudinary';

// Get all gardens (for map view)
const getAllGardens = async () => {
	try {
		const gardens = await GardenModel.find()
			.select('id user_id name location longitude latitude image')
			.populate('user_id', 'full_name avatar');
		return gardens;
	} catch (error) {
		throw error;
	}
};

// Get gardens by user ID
const getGardensByUser = async (userId) => {
	try {
		const gardens = await GardenModel.find({ user_id: userId });
		if (!gardens) {
			throw createError(404, 'Gardens not found');
		}
		return gardens;
	} catch (error) {
		throw error;
	}
};

// Get garden details by ID
const getGardenById = async (gardenId) => {
	try {
		const garden = await GardenModel.findById(gardenId);
		if (!garden) {
			throw createError(404, 'Garden not found');
		}
		return garden;
	} catch (error) {
		throw error;
	}
};

const createGarden = async (userId, gardenData) => {
	try {
		const {
			name,
			crop_type,
			area,
			location,
			longitude,
			latitude,
			description,
			image,
		} = gardenData;

		// Validate required fields
		if (
			!name ||
			!crop_type ||
			!area ||
			!location ||
			area <= 0 ||
			!description
		) {
			throw createError(400, 'Missing or invalid required fields');
		}

		let imageUrl = '';
		if (image) {
			try {
				const result = await cloudinary.uploader.upload(image, {
					folder: 'vietdurian',
				});
				imageUrl = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}
		const newGarden = new GardenModel({
			user_id: userId,
			name,
			crop_type,
			area,
			location,
			longitude,
			latitude,
			description,
			image: imageUrl,
		});

		await newGarden.save();
		return newGarden;
	} catch (error) {
		throw error;
	}
};

// Update garden record
const updateGarden = async (gardenId, updateData) => {
	try {
    if (updateData.image) {
			try {
				const result = await cloudinary.uploader.upload(updateData.image, {
					folder: 'vietdurian',
				});
				updateData.image = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}
		const updatedGarden = await GardenModel.findByIdAndUpdate(
			gardenId,
			updateData,
			{
				new: true,
			},
		);

		if (!updatedGarden) {
			throw createError(404, 'Garden not found');
		}

		return updatedGarden;
	} catch (error) {
		throw error;
	}
};

// Delete garden record
const deleteGarden = async (gardenId) => {
	try {
		const deletedGarden = await GardenModel.findByIdAndDelete(gardenId);
		if (!deletedGarden) {
			throw createError(404, 'Garden not found');
		}
		return deletedGarden;
	} catch (error) {
		throw error;
	}
};

export const gardenService = {
	getAllGardens,
	getGardensByUser,
	getGardenById,
	createGarden,
	updateGarden,
	deleteGarden,
};
