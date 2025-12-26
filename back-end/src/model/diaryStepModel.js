import mongoose from 'mongoose';

const diaryStepSchema = new mongoose.Schema(
	{
		diary_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Diary',
			required: true,
		},
		stage_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Step',
		},
		step_name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		cost: {
			type: Number,
			default: 0,
		},
		image: {
			type: String,
		},
		action_date: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const DiaryStepModel = mongoose.model('DiaryStep', diaryStepSchema);

export { DiaryStepModel };
