import mongoose from 'mongoose';

const GardenSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		// Loại cây trồng
		crop_type: {
			type: String,
			required: true,
		},
		area: {
			type: Number,
			required: true,
		},
		// Vị trí vườn (tên)
		location: {
			type: String,
			required: true,
		},
		longitude: {
			type: Number,
		},
		latitude: {
			type: Number,
		},
		description: {
			type: String,
		},
		image: {
			type: String,
			default: '',
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const GardenModel = mongoose.model('Garden', GardenSchema);
export { GardenModel };
