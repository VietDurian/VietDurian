import mongoose from 'mongoose';

const BuyingSeedSchema = new mongoose.Schema(
	{
		// Nhật ký mùa vụ sở hữu bản ghi giống này
		season_diary_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SeasonDiary',
			required: true,
		},
		// Ngày mua giống hoặc ngày tự sản xuất giống
		purchase_date: {
			type: Date,
			required: true,
		},
		// Tên giống trồng
		seed_name: {
			type: String,
			trim: true,
			required: true,
		},
		// Số lượng mua (cây)
		quantity: {
			type: Number,
			min: 0,
			required: true,
		},
		// Total price
		total_price: {
			type: Number,
			min: 0,
			required: true,
		},
		// Tên đại lý hoặc nơi cung cấp giống
		supplier_name: {
			type: String,
			trim: true,
			required: true,
		},
		// Địa chỉ nơi cung cấp giống
		supplier_address: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const BuyingSeedModel = mongoose.model('BuyingSeed', BuyingSeedSchema);

export { BuyingSeedModel };
