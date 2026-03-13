import { PackagingHandling } from "@/model/packagingHandlingModel";
import { SeasonDiary } from "@/model/seasonDiaryModel";

const ensureDiaryAccess = async (userId, season_diary_id) => {
  const diary = await SeasonDiary.findById(season_diary_id);
  if (!diary) throw new Error("Nhật ký mùa vụ không tồn tại");
  if (diary.user_id.toString() !== userId) throw new Error("Không có quyền truy cập");
  return diary;
};

export const createPackagingHandling = async (userId, data) => {
  await ensureDiaryAccess(userId, data.season_diary_id);
  const { season_diary_id, handling_date, packaging_type, storage_location, treatment_method } = data;
  return await PackagingHandling.create({
    season_diary_id,
    handling_date,
    packaging_type,
    storage_location,
    treatment_method,
  });
};

export const getPackagingHandlingList = async (userId, season_diary_id, limit = 20, skip = 0) => {
  await ensureDiaryAccess(userId, season_diary_id);
  return await PackagingHandling.find({ season_diary_id })
    .sort({ handling_date: -1 })
    .limit(limit)
    .skip(skip);
};

export const getPackagingHandlingDetail = async (userId, id) => {
  const record = await PackagingHandling.findById(id);
  if (!record) throw new Error("Bản ghi không tồn tại");
  await ensureDiaryAccess(userId, record.season_diary_id);
  return record;
};

export const updatePackagingHandling = async (userId, id, data) => {
  const record = await PackagingHandling.findById(id);
  if (!record) throw new Error("Bản ghi không tồn tại");
  await ensureDiaryAccess(userId, record.season_diary_id);
  return await PackagingHandling.findByIdAndUpdate(id, data, { new: true });
};

export const deletePackagingHandling = async (userId, id) => {
  const record = await PackagingHandling.findById(id);
  if (!record) throw new Error("Bản ghi không tồn tại");
  await ensureDiaryAccess(userId, record.season_diary_id);
  return await PackagingHandling.findByIdAndDelete(id);
};
