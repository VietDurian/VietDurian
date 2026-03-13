import mongoose from 'mongoose';

const SeasonDiarySchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		// Tên vườn
		garden_name: {
			type: String,
			trim: true,
			required: true,
		},
		// Tên nông hộ
		farmer_name: {
			type: String,
			trim: true,
			required: true,
		},
		// Vị trí vườn (tên)
		location: {
			type: String,
			trim: true,
			required: true,
		},
		longitude: {
			type: String,
			required: true,
		},
		latitude: {
			type: String,
			required: true,
		},
		// Thông tin thành viên (có thể lưu danh sách tên hoặc mô tả)
		members: {
			type: String,
			trim: true,
			default: '',
		},
		// Mã số vùng trồng
		planting_area_code: {
			type: String,
			trim: true,
			default: '',
		},
		// Tên giống cây trồng
		crop_variety: {
			type: [String],
			required: true,
			default: [],
		},
		// Mã số nông hộ
		farmer_code: {
			type: String,
			trim: true,
			default: '',
		},
		// Số hàng/luống/liếp cây trong vườn
		row_bed_count: {
			type: Number,
			default: 0,
			min: 0,
		},
		area: {
			type: Number,
			required: true,
		},
		// Lịch sử khu đất canh tác
		land_use_history: {
			type: String,
			trim: true,
			default: '',
		},
		status: {
			type: String,
			enum: ['In progressing', 'Completed'],
			default: 'In progressing',
		},
		end_date: {
			type: Date,
		},

	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	},
);

const SeasonDiaryModel = mongoose.model('SeasonDiary', SeasonDiarySchema);
export { SeasonDiaryModel };
