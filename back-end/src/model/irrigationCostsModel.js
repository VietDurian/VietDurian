import mongoose from 'mongoose';

const irrigationMethodEnum = ['nho_giot', 'phun_mua', 'thu_cong'];

const IrrigationCostsSchema = new mongoose.Schema(
	{
		season_diary_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SeasonDiary',
			required: true,
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		// Clear, timezone-safe date format: YYYY-MM-DD
		execution_date: {
			type: String,
			trim: true,
			default: null,
			match: [/^\d{4}-\d{2}-\d{2}$/, 'execution_date must be in YYYY-MM-DD format'],
		},
		irrigation_item: {
			type: String,
			trim: true,
			default: '',
		},
		irrigation_method: {
			type: String,
			enum: irrigationMethodEnum,
			required: false,
			default: null,
		},
		irrigation_duration_hours: {
			type: Number,
			required: false,
			default: null,
		},
		irrigation_area: {
			type: String,
			trim: true,
			default: '',
		},
		electricity_fuel_cost: {
			type: Number,
			required: false,
			default: null,
		},
		performed_by: {
			type: String,
			trim: true,
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

const IrrigationCostsModel = mongoose.model('IrrigationCosts', IrrigationCostsSchema);

export { IrrigationCostsModel, irrigationMethodEnum };
