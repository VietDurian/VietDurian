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
		action_type: {
			type: String,
			enum: ['Vật tư', 'Công việc', 'Chỉ số'],
			required: true,
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

		// Dùng cho Loại: Vật tư (Phân bón/Thuốc)
        item_name: { type: String },    // Tên thuốc/phân
        dosage: { type: String },       // Liều lượng (200ml/phuy)
        supplier: { type: String },          // Tên đại lý cung cấp

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
	},
);

const DiaryStepModel = mongoose.model('DiaryStep', diaryStepSchema);

export { DiaryStepModel };
