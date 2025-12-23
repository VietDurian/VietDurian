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
		step_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Step',
		},
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
		},
		cost: {
			type: Number,
			default: 0,
		},
		revenue: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const DiaryModel = mongoose.model('Diary', DiarySchema);
export { DiaryModel };
