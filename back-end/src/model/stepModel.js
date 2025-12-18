import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
	{
		parent_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Step',
			default: null,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		order_index: {
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

const StepModel = mongoose.model('Step', stepSchema);

export { StepModel };
