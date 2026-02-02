import mongoose from 'mongoose';

const typeProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		}
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const TypeProductModel = mongoose.model(
	'TypeProduct',
	typeProductSchema
);

export { TypeProductModel };
