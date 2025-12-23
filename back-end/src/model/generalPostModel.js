import { auth } from 'google-auth-library';
import mongoose from 'mongoose';

const generalPostSchema = new mongoose.Schema(
	{
		author_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		category: {
			type: String,
            enum: ['Dịch vụ', 'Kinh nghiệm', 'Sản phẩm', 'Thuê dịch vụ', 'Khác'],
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
        image: {
            type: String,
            default: '',
        },
		contact: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ['progressing', 'active', 'inactive'],
			default: 'progressing',
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
);

const GeneralPostModel = mongoose.model('GeneralPost', generalPostSchema);

export { GeneralPostModel };
