import mongoose from 'mongoose';

const BuyingFertilizersSchema = new mongoose.Schema(
	{
		// Related season diary
		season_diary_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SeasonDiary',
			required: true,
		},
		// Purchase or production date
		purchase_date: {
			type: Date,
			required: true,
		},
		// Material name
		material_name: {
			type: String,
			trim: true,
			required: true,
		},
		// Purchased quantity (kg, g, l, ml)
		quantity: {
			type: Number,
			min: 0,
			required: true,
		},
		// Total price
		total_price: {
			type: Number,
			min: 0,
			required: true,
		},
		// Quantity unit
		unit: {
			type: String,
			enum: ['kg', 'g', 'l', 'ml'],
			required: true,
		},
		// Supplier name
		supplier_name: {
			type: String,
			trim: true,
			required: true,
		},
		// Supplier address
		supplier_address: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const BuyingFertilizersModel = mongoose.model(
	'BuyingFertilizers',
	BuyingFertilizersSchema,
);

export { BuyingFertilizersModel };
