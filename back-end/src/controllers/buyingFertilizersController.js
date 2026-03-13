import { buyingFertilizersService } from '@/services/buyingFertilizersService';

const viewBuyingFertilizersList = async (req, res, next) => {
	try {
		const { page, limit, season_diary_id, seasonDiaryId } = req.query;
		const userId = req.user?.id || req.user?._id;

		const result = await buyingFertilizersService.viewBuyingFertilizersList({
			page,
			limit,
			seasonDiaryId: season_diary_id || seasonDiaryId,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Buying fertilizers list retrieved successfully',
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error) {
		next(error);
	}
};

const createBuyingFertilizers = async (req, res, next) => {
	try {
		const {
			season_diary_id,
			purchase_date,
			material_name,
			quantity,
			total_price,
			unit,
			supplier_name,
			supplier_address,
		} = req.body;

		if (
			!season_diary_id ||
			!purchase_date ||
			!material_name ||
			quantity === undefined ||
			total_price === undefined ||
			!unit ||
			!supplier_name ||
			!supplier_address
		) {
			return res.status(400).json({
				code: 400,
				message:
					'season_diary_id, purchase_date, material_name, quantity, total_price, unit, supplier_name, and supplier_address are required',
			});
		}

		const userId = req.user?.id || req.user?._id;
		const created = await buyingFertilizersService.createBuyingFertilizers({
			userId,
			role: req.user?.role,
			data: req.body,
		});

		res.status(201).json({
			code: 201,
			message: 'Tạo nhật kí mua vật tư thành công',
			data: created,
		});
	} catch (error) {
		next(error);
	}
};

const updateBuyingFertilizers = async (req, res, next) => {
	try {
		const { buying_fertilizers_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		if (!Object.keys(req.body || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		const updated = await buyingFertilizersService.updateBuyingFertilizers({
			buyingFertilizersId: buying_fertilizers_id,
			userId,
			role: req.user?.role,
			data: req.body,
		});

		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật kí mua vật tư thành công',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

const deleteBuyingFertilizers = async (req, res, next) => {
	try {
		const { buying_fertilizers_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		await buyingFertilizersService.deleteBuyingFertilizers({
			buyingFertilizersId: buying_fertilizers_id,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Xóa nhật kí mua vật tư thành công',
		});
	} catch (error) {
		next(error);
	}
};

export const buyingFertilizersController = {
	viewBuyingFertilizersList,
	createBuyingFertilizers,
	updateBuyingFertilizers,
	deleteBuyingFertilizers,
};
