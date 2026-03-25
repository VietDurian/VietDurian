import { PackagingHandling } from "@/model/packagingHandlingModel";
import { SeasonDiaryModel } from "@/model/seasonDiaryModel";

const ensureDiaryExists = async (season_diary_id) => {
  const diary = await SeasonDiaryModel.findById(season_diary_id);
  if (!diary) throw new Error("Nhật ký mùa vụ không tồn tại");
  return diary;
};

export const createPackagingHandling = async (userId, data) => {
  await ensureDiaryExists(data.season_diary_id);
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
  await ensureDiaryExists(season_diary_id);
  return await PackagingHandling.find({ season_diary_id })
    .sort({ handling_date: -1 })
    .limit(limit)
    .skip(skip);
};

export const getPackagingHandlingDetail = async (userId, id) => {
  const record = await PackagingHandling.findById(id);
  if (!record) throw new Error("Bản ghi không tồn tại");
  return record;
};

export const updatePackagingHandling = async (userId, id, data) => {
  const record = await PackagingHandling.findById(id);
  if (!record) throw new Error("Bản ghi không tồn tại");
  return await PackagingHandling.findByIdAndUpdate(id, data, { new: true });
};

export const deletePackagingHandling = async (userId, id) => {
  const record = await PackagingHandling.findById(id);
  if (!record) throw new Error("Bản ghi không tồn tại");
  return await PackagingHandling.findByIdAndDelete(id);
};
