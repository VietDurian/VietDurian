import mongoose from 'mongoose';

const UseFertilizersSchema = new mongoose.Schema(
	{
		// Related season diary
		season_diary_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SeasonDiary',
			required: true,
		},
		// Date of fertilizer or pesticide usage
		usage_date: {
			type: Date,
			required: true,
		},
		// Fertilizer name
		fertilizer_name: {
			type: String,
			trim: true,
			default: '',
		},
		// Fertilizer amount used (free text: kg/g/l/ml)
		fertilizer_amount: {
			type: String,
			trim: true,
			default: '',
		},
		// Pesticide name
		pesticide_name: {
			type: String,
			trim: true,
			default: '',
		},
		// Pesticide concentration and amount used
		pesticide_concentration_amount: {
			type: String,
			trim: true,
			default: '',
		},
		// Pre-harvest interval / waiting time
		preharvest_interval: {
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

const UseFertilizersModel = mongoose.model('UseFertilizers', UseFertilizersSchema);

export { UseFertilizersModel };
