import mongoose from 'mongoose';

const LaborCostsSchema = new mongoose.Schema(
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
		// Clear date format to avoid timezone confusion
		labor_hire_date: {
			type: Date,
			default: null,
		},
		work_description: {
			type: String,
			trim: true,
			default: '',
		},
		worker_quantity: {
			type: Number,
			required: false,
			default: null,
		},
		working_time: {
			hours: {
				type: Number,
				required: false,
				default: null,
				min: 0,
			},
			minutes: {
				type: Number,
				required: false,
				default: null,
				min: 0,
				max: 59,
			},
		},
		unit_price_vnd: {
			type: Number,
			required: false,
			default: null,
		},
		worker_or_team_name: {
			type: String,
			trim: true,
			default: '',
		},
		supervisor_name: {
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

const LaborCostsModel = mongoose.model('LaborCosts', LaborCostsSchema);

export { LaborCostsModel };
