import mongoose from 'mongoose';

const DiarySchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		crop_type: {
			type: String,
			required: true,
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
		quatity_durian: {
			type: Number,
			default: 0,
		},
		price: {
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
