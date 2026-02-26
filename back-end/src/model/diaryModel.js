import mongoose from 'mongoose';

const DiarySchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		garden_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Garden',
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		status: {
			type: String,
			enum: ['In progressing', 'Completed'],
			default: 'In progressing',
		},
		start_date: {
			type: Date,
			default: Date.now,
		},
		end_date: {
			type: Date,
		},
		weight_durian: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			default: 0,
		},
		total_cost: {
			type: Number,
			default: 0,
		},
		total_revenue: {
			type: Number,
			default: 0,
		},
		profit: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const DiaryModel = mongoose.model('Diary', DiarySchema);
export { DiaryModel };
