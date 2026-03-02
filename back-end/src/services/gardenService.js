import { GardenModel } from '../model/gardenModel.js';
import createError from 'http-errors';
import { cloudinary } from '@/config/cloudinary';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NOMINATIM_BASE_URL = String(
	process.env.NOMINATIM_BASE_URL ||
		'https://nominatim.openstreetmap.org/search',
).trim();
const NOMINATIM_USER_AGENT = String(
	process.env.NOMINATIM_USER_AGENT || '',
).trim();
const NOMINATIM_DELAY_MS = Number(process.env.NOMINATIM_DELAY_MS ?? 1100);
const NOMINATIM_MAX_PER_REQUEST = Number(
	process.env.NOMINATIM_MAX_PER_REQUEST ?? 10,
);

const geocodeCache = new Map();

const normalizeCropTypes = (cropTypeValue) => {
	if (Array.isArray(cropTypeValue)) {
		return [
			...new Set(
				cropTypeValue.map((item) => String(item || '').trim()).filter(Boolean),
			),
		];
	}

	const single = String(cropTypeValue || '').trim();
	return single ? [single] : [];
};

const geocodeLocation = async (location) => {
	if (!NOMINATIM_USER_AGENT) return null;

	const loc = String(location || '').trim();
	if (!loc) return null;
	if (geocodeCache.has(loc)) return geocodeCache.get(loc);

	const q = `${loc}, Vietnam`;
	const url = `${NOMINATIM_BASE_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;

	const res = await fetch(url, {
		headers: {
			'User-Agent': NOMINATIM_USER_AGENT,
			Accept: 'application/json',
			'Accept-Language': 'vi,en;q=0.8',
		},
	});
	if (!res.ok) return null;

	const json = await res.json();
	const first = Array.isArray(json) ? json[0] : null;
	const lat = Number(first?.lat);
	const lon = Number(first?.lon);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

	const coords = { latitude: lat, longitude: lon };
	geocodeCache.set(loc, coords);
	return coords;
};

const geocodeAllMissingGardens = async ({ limit } = {}) => {
	if (!NOMINATIM_USER_AGENT) {
		throw createError(
			500,
			'Missing NOMINATIM_USER_AGENT in environment (.env)',
		);
	}

	const effectiveLimit = Number.isFinite(Number(limit)) ? Number(limit) : 500;
	let attempted = 0;
	let updated = 0;

	const missingQuery = {
		location: { $exists: true, $ne: '' },
		$or: [
			{ latitude: { $exists: false } },
			{ longitude: { $exists: false } },
			{ latitude: null },
			{ longitude: null },
		],
	};

	const gardens = await GardenModel.find(missingQuery)
		.select('_id location latitude longitude')
		.limit(effectiveLimit)
		.lean();

	for (const g of gardens) {
		const loc = String(g?.location || '').trim();
		if (!loc) continue;
		attempted += 1;

		const coords = await geocodeLocation(loc);
		if (coords) {
			await GardenModel.updateOne(
				{ _id: g._id },
				{ $set: { latitude: coords.latitude, longitude: coords.longitude } },
			);
			updated += 1;
		}

		if (NOMINATIM_DELAY_MS > 0) {
			await sleep(NOMINATIM_DELAY_MS);
		}
	}

	return { attempted, updated, limit: effectiveLimit };
};

// Get all gardens (for map view)
const getAllGardens = async () => {
	try {
		const gardens = await GardenModel.find()
			.select('id user_id name unit_code location longitude latitude image area')
			.populate('user_id', 'full_name avatar')
			.lean();

		// If NOMINATIM_USER_AGENT is not configured, skip geocoding (still return gardens).
		if (!NOMINATIM_USER_AGENT) {
			return gardens;
		}

		// Geocode missing coordinates using location and cache them in DB.
		// Limit per request to avoid long response times and to respect Nominatim rate limits.
		let geocodedCount = 0;
		for (const g of gardens) {
			if (geocodedCount >= NOMINATIM_MAX_PER_REQUEST) break;
			const hasLat = Number.isFinite(Number(g?.latitude));
			const hasLng = Number.isFinite(Number(g?.longitude));
			const loc = String(g?.location || '').trim();
			if ((hasLat && hasLng) || !loc) continue;

			const coords = await geocodeLocation(loc);
			geocodedCount += 1;
			if (coords) {
				g.latitude = coords.latitude;
				g.longitude = coords.longitude;
				await GardenModel.updateOne(
					{ _id: g._id },
					{ $set: { latitude: coords.latitude, longitude: coords.longitude } },
				);
			}

			if (NOMINATIM_DELAY_MS > 0) {
				await sleep(NOMINATIM_DELAY_MS);
			}
		}

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
			unit_code,
			crop_type,
			area,
			location,
			longitude,
			latitude,
			description,
			image,
		} = gardenData;

		const normalizedUnitCode = String(unit_code || '').trim();
		const normalizedCropTypes = normalizeCropTypes(crop_type);

		// Validate required fields
		if (
			!name ||
			!normalizedUnitCode ||
			normalizedCropTypes.length === 0 ||
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
				throw error;
			}
		}
		const newGarden = new GardenModel({
			user_id: userId,
			name,
			unit_code: normalizedUnitCode,
			crop_type: normalizedCropTypes,
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
		if (Object.prototype.hasOwnProperty.call(updateData, 'unit_code')) {
			updateData.unit_code = String(updateData.unit_code || '').trim();
		}

		if (Object.prototype.hasOwnProperty.call(updateData, 'crop_type')) {
			updateData.crop_type = normalizeCropTypes(updateData.crop_type);
		}

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
	geocodeAllMissingGardens,
	getGardensByUser,
	getGardenById,
	createGarden,
	updateGarden,
	deleteGarden,
};
