import mongoose from 'mongoose';

const HarvestConsumptionSchema = new mongoose.Schema(
	{
		season_diary_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'SeasonDiary',
			required: true,
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		// Ngay/thang/nam thu hoach
		harvest_date: {
			type: Date,
			required: true,
		},
		// San luong thu hoach (kg)
		harvest_quantity_kg: {
			type: Number,
			required: true,
			min: 0,
		},
		// Thoi gian xuat ban san pham (ngay/thang/nam)
		sale_date: {
			type: Date,
			default: null,
		},
		// Ten dia chi co so thu mua hoac tieu thu
		buyer_or_consumption_address: {
			type: String,
			trim: true,
			default: '',
		},
		// Khoi luong tieu thu (kg)
		consumed_weight_kg: {
			type: Number,
			required: false,
			default: null,
		},
		// Don gia ban (VND/kg)
		sale_unit_price_vnd: {
			type: Number,
			required: false,
			default: null,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const HarvestConsumptionModel = mongoose.model(
	'HarvestConsumption',
	HarvestConsumptionSchema,
);

export { HarvestConsumptionModel };
