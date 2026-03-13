import mongoose from "mongoose";

const { Schema } = mongoose;

const packagingHandlingSchema = new Schema(
  {
    season_diary_id: {
      type: Schema.Types.ObjectId,
      ref: "SeasonDiary",
      required: true,
    },
    // Ngày xử lý bao bì
    handling_date: {
      type: Date,
      required: true,
    },
    // Loại bao bì (ví dụ: thùng chứa thuốc dư thừa, bao đựng hạt giống, vỏ bao phân bón)
    packaging_type: {
      type: String,
      required: true,
    },
    // Vị trí lưu trữ sau khi xử lý (ví dụ: kho phía Bắc, khu vực chôn lấp phía Nam)
    storage_location: {
      type: String,
      required: true,
    },
    // Cách thức xử lý (ví dụ: đốt, chôn, tái chế)
    treatment_method: {
      type: String,
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

export const PackagingHandling = mongoose.model(
  "PackagingHandling",
  packagingHandlingSchema
);
