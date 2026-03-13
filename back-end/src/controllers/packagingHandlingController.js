import createError from "http-errors";
import * as packagingHandlingService from "@/services/packagingHandlingService";

export const create = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { season_diary_id, handling_date, packaging_type, storage_location, treatment_method } = req.body;

    if (!season_diary_id || !handling_date || !packaging_type || !storage_location || !treatment_method) {
      throw createError(400, "Thiếu dữ liệu bắt buộc");
    }

    const result = await packagingHandlingService.createPackagingHandling(userId, {
      season_diary_id,
      handling_date,
      packaging_type,
      storage_location,
      treatment_method,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { season_diary_id, limit = 20, skip = 0 } = req.query;

    if (!season_diary_id) {
      throw createError(400, "Thiếu season_diary_id");
    }

    const result = await packagingHandlingService.getPackagingHandlingList(
      userId,
      season_diary_id,
      parseInt(limit),
      parseInt(skip)
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const detail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const result = await packagingHandlingService.getPackagingHandlingDetail(userId, id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { handling_date, packaging_type, storage_location, treatment_method } = req.body;

    const result = await packagingHandlingService.updatePackagingHandling(userId, id, {
      handling_date,
      packaging_type,
      storage_location,
      treatment_method,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await packagingHandlingService.deletePackagingHandling(userId, id);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (err) {
    next(err);
  }
};
