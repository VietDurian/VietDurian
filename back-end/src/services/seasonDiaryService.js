import { SeasonDiaryModel } from '@/model/seasonDiaryModel';
import { BuyingSeedModel } from '@/model/buyingSeedModel';
import { BuyingFertilizersModel } from '@/model/buyingFertilizersModel';
import { LaborCostsModel } from '@/model/laborCostsModel';
import { IrrigationCostsModel } from '@/model/irrigationCostsModel';
import { HarvestConsumptionModel } from '@/model/harvestConsumptionModel';
import { Product } from '@/model/productModel.js';
import createError from 'http-errors';
import mongoose from 'mongoose';

const VALID_STATUSES = ['Stopped', 'In progressing', 'Completed'];

const escapeRegex = (text = '') =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeGardenName = (name = '') => name.trim();
const normalizeImage = (image = '') => image.trim();

const ensureValidObjectId = (id, fieldName = 'id') => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw createError(400, `${fieldName} không hợp lệ`);
	}
};

const toNumber = (value, fallback = 0) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const roundNumber = (value, digits = 2) =>
	Number(toNumber(value, 0).toFixed(digits));

const M2_PER_HA = 10000;

const calculatePercent = (part, total) => {
	if (!total) return 0;
	return roundNumber((toNumber(part) / toNumber(total)) * 100);
};

// Kiểm tra tính duy nhất của tên vườn, bỏ qua khoảng trắng và phân biệt chữ hoa thường
const ensureUniqueGardenName = async ({ gardenName, excludeId = null }) => {
	const normalizedName = normalizeGardenName(gardenName);
	if (!normalizedName) {
		return;
	}

	const query = {
		garden_name: {
			$regex: `^${escapeRegex(normalizedName)}$`,
			$options: 'i',
		},
	};

	if (excludeId) {
		query._id = { $ne: excludeId };
	}

	const existedDiary = await SeasonDiaryModel.findOne(query).select('_id').lean();
	if (existedDiary) {
		throw createError(409, 'Tên vườn đã tồn tại, vui lòng chọn tên khác');
	}
};

const getSeasonDiaryList = async ({ status, userId }) => {
	try {
		const query = {};

		if (status) {
			if (!VALID_STATUSES.includes(status)) {
				throw createError(400, 'Giá trị trạng thái không hợp lệ');
			}
			query.status = status;
		}

		if (userId) {
			ensureValidObjectId(userId, 'userId');
			query.user_id = userId;
		}

		const diaries = await SeasonDiaryModel.find(query)
			.populate({
				path: 'user_id',
				select: 'full_name email avatar',
			})
			.sort({ created_at: -1 })
			.lean();

		return diaries;
	} catch (error) {
		throw error;
	}
};

const getSeasonDiaryDetail = async (seasonDiaryId) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId)
			.populate({
				path: 'user_id',
				select: 'full_name email avatar',
			})
			.lean();

		if (!diary) {
			throw createError(404, 'Không tìm thấy nhật ký mùa vụ');
		}

		return diary;
	} catch (error) {
		throw error;
	}
};

const createSeasonDiary = async ({ userId, data }) => {
	try {
		await ensureUniqueGardenName({ gardenName: data.garden_name });

		const newDiary = new SeasonDiaryModel({
			...data,
			garden_name: normalizeGardenName(data.garden_name),
			image: typeof data.image === 'string' ? normalizeImage(data.image) : data.image,
			user_id: userId,
		});

		const savedDiary = await newDiary.save();
		return savedDiary;
	} catch (error) {
		throw error;
	}
};

const updateSeasonDiary = async ({ seasonDiaryId, data }) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId);
		if (!diary) {
			throw createError(404, 'Không tìm thấy nhật ký mùa vụ');
		}

		if (Object.prototype.hasOwnProperty.call(data, 'status')) {
			if (!VALID_STATUSES.includes(data.status)) {
				throw createError(400, 'Giá trị trạng thái không hợp lệ');
			}
		}

		delete data.end_date;

		if (typeof data.garden_name === 'string') {
			await ensureUniqueGardenName({
				gardenName: data.garden_name,
				excludeId: seasonDiaryId,
			});
			data.garden_name = normalizeGardenName(data.garden_name);
		}

		if (typeof data.image === 'string') {
			data.image = normalizeImage(data.image);
		}

		Object.assign(diary, data);
		const updatedDiary = await diary.save();

		return updatedDiary;
	} catch (error) {
		throw error;
	}
};

const deleteSeasonDiary = async ({ seasonDiaryId}) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId);
		if (!diary) {
			throw createError(404, 'Không tìm thấy nhật ký mùa vụ');
		}

		if (diary.status !== 'In progressing') {
			throw createError(
				400,
				'Chỉ có thể xóa nhật ký mùa vụ ở trạng thái "In progressing"',
			);
		}

		const linkedProduct = await Product.findOne({
			season_diary_id: seasonDiaryId,
		})
			.select('_id')
			.lean();

		if (linkedProduct) {
			throw createError(
				400,
				'Không thể xóa nhật ký mùa vụ vì đang có sản phẩm liên kết',
			);
		}

		await SeasonDiaryModel.findByIdAndDelete(seasonDiaryId);
		return true;
	} catch (error) {
		throw error;
	}
};

const finishSeasonDiary = async ({ seasonDiaryId }) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId);
		if (!diary) {
			throw createError(404, 'Không tìm thấy nhật ký mùa vụ');
		}

		diary.status = 'Completed';
		diary.end_date = new Date();

		const updatedDiary = await diary.save();
		return updatedDiary;
	} catch (error) {
		throw error;
	}
};

const getSeasonDiaryStatistics = async ({
	seasonDiaryId,
	userId,
}) => {
	try {
		ensureValidObjectId(seasonDiaryId, 'seasonDiaryId');

		const diary = await SeasonDiaryModel.findById(seasonDiaryId)
			.select('_id user_id garden_name area status created_at end_date')
			.lean();

		if (!diary) {
			throw createError(404, 'Không tìm thấy nhật ký mùa vụ');
		}

		const isOwner = String(diary.user_id) === String(userId);
		if (!isOwner) {
			throw createError(403, 'Bạn không có quyền truy cập nhật ký mùa vụ này');
		}

		const seasonDiaryObjectId = new mongoose.Types.ObjectId(seasonDiaryId);

		const [seedAgg, fertilizerAgg, laborAgg, irrigationAgg, harvestAgg] =
			await Promise.all([
				BuyingSeedModel.aggregate([
					{ $match: { season_diary_id: seasonDiaryObjectId } },
					{ $group: { _id: null, total: { $sum: { $ifNull: ['$total_price', 0] } } } },
				]),
				BuyingFertilizersModel.aggregate([
					{ $match: { season_diary_id: seasonDiaryObjectId } },
					{ $group: { _id: null, total: { $sum: { $ifNull: ['$total_price', 0] } } } },
				]),
				LaborCostsModel.aggregate([
					{ $match: { season_diary_id: seasonDiaryObjectId } },
					{
						$project: {
							computed_cost: {
								$ifNull: ['$total_price_vnd', { $ifNull: ['$unit_price_vnd', 0] }],
							},
						},
					},
					{ $group: { _id: null, total: { $sum: '$computed_cost' } } },
				]),
				IrrigationCostsModel.aggregate([
					{ $match: { season_diary_id: seasonDiaryObjectId } },
					{
						$group: {
							_id: null,
							total: { $sum: { $ifNull: ['$electricity_fuel_cost', 0] } },
						},
					},
				]),
				HarvestConsumptionModel.aggregate([
					{
						$match: {
							season_diary_id: seasonDiaryObjectId,
							$or: [{ sale_date: { $ne: null } }, { harvest_date: { $ne: null } }],
						},
					},
					{
						$group: {
							_id: null,
							total_harvest_kg: { $sum: { $ifNull: ['$harvest_quantity_kg', 0] } },
							total_consumed_kg: { $sum: { $ifNull: ['$consumed_weight_kg', 0] } },
							total_revenue: {
								$sum: {
									$cond: [
										{
											$and: [
												{ $ne: ['$consumed_weight_kg', null] },
												{ $ne: ['$sale_unit_price_vnd', null] },
											],
										},
										{ $multiply: ['$consumed_weight_kg', '$sale_unit_price_vnd'] },
										0,
									],
								},
							},
						},
					},
				]),
			]);

		const seedCost = toNumber(seedAgg?.[0]?.total, 0);
		const fertilizerCost = toNumber(fertilizerAgg?.[0]?.total, 0);
		const laborCost = toNumber(laborAgg?.[0]?.total, 0);
		const irrigationCost = toNumber(irrigationAgg?.[0]?.total, 0);
		const totalCost = seedCost + fertilizerCost + laborCost + irrigationCost;
		const totalHarvestKg = toNumber(harvestAgg?.[0]?.total_harvest_kg, 0);
		const totalConsumedKg = toNumber(harvestAgg?.[0]?.total_consumed_kg, 0);
		const totalRevenue = toNumber(harvestAgg?.[0]?.total_revenue, 0);
		console.log('totalRevenue', totalRevenue);

		const profit = totalRevenue - totalCost;
		const marginPercent = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0; // Lợi nhuận trên doanh thu
		const costPerKg = totalHarvestKg > 0 ? totalCost / totalHarvestKg : 0; // Chi phí trên mỗi kg thu hoạch
		const yieldPerArea = toNumber(diary.area) > 0 ? totalHarvestKg / toNumber(diary.area) : 0;

		return {
			diary: {
				id: diary._id,
				garden_name: diary.garden_name,
				status: diary.status,
				area: toNumber(diary.area, 0),
				start_date: diary.created_at || null,
				end_date: diary.end_date || null,
			},
			overview: {
				total_cost: roundNumber(totalCost),
				total_revenue: roundNumber(totalRevenue),
				profit: roundNumber(profit),
				margin_percent: roundNumber(marginPercent),
				cost_per_kg: roundNumber(costPerKg),
				yield_per_area: roundNumber(yieldPerArea),
			},
			harvest: {
				total_harvest_kg: roundNumber(totalHarvestKg),
				total_consumed_kg: roundNumber(totalConsumedKg),
				unsold_weight_kg: roundNumber(totalHarvestKg - totalConsumedKg),
				consumed_rate_percent: calculatePercent(totalConsumedKg, totalHarvestKg),
			},
			cost_breakdown: {
				seed: {
					amount: roundNumber(seedCost),
					percent: calculatePercent(seedCost, totalCost),
				},
				fertilizer: {
					amount: roundNumber(fertilizerCost),
					percent: calculatePercent(fertilizerCost, totalCost),
				},
				labor: {
					amount: roundNumber(laborCost),
					percent: calculatePercent(laborCost, totalCost),
				},
				irrigation: {
					amount: roundNumber(irrigationCost),
					percent: calculatePercent(irrigationCost, totalCost),
				},
			},
		};
	} catch (error) {
		throw error;
	}
};

const getSeasonDiaryMapPoints = async () => {
	try {
		const diaries = await SeasonDiaryModel.find({
			latitude: { $exists: true, $nin: [null, ''] },
			longitude: { $exists: true, $nin: [null, ''] },
		})
			.select('_id garden_name location latitude longitude area')
			.sort({ created_at: -1 })
			.lean();

		return diaries
			.map((diary) => {
				const latitude = Number(diary.latitude);
				const longitude = Number(diary.longitude);
				const areaM2 = toNumber(diary.area, 0);

				if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
					return null;
				}

				return {
					id: diary._id,
					name: diary.garden_name || 'Vuon',
					location: diary.location || '',
					latitude,
					longitude,
					area: areaM2,
					area_m2: areaM2,
					area_ha: roundNumber(areaM2 / M2_PER_HA, 4),
				};
			})
			.filter(Boolean);
	} catch (error) {
		throw error;
	}
};



export const seasonDiaryService = {
	getSeasonDiaryList,
	getSeasonDiaryDetail,
	createSeasonDiary,
	updateSeasonDiary,
	deleteSeasonDiary,
	finishSeasonDiary,
	getSeasonDiaryStatistics,
	getSeasonDiaryMapPoints,
};
