import mongoose from 'mongoose';

const knowledgeBlockSchema = new mongoose.Schema(
	{
		blog_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Blog',
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
        image: {
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

const KnowledgeBlockModel = mongoose.model(
	'KnowledgeBlock',
	knowledgeBlockSchema
);

export { KnowledgeBlockModel };
