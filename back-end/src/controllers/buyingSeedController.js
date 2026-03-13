import { buyingSeedService } from '@/services/buyingSeedService';

const viewBuyingSeedList = async (req, res, next) => {
	try {
		const { page, limit, season_diary_id, seasonDiaryId } = req.query;
		const userId = req.user?.id || req.user?._id;

		const result = await buyingSeedService.viewBuyingSeedList({
			page,
			limit,
			seasonDiaryId: season_diary_id || seasonDiaryId,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Danh sách mua giống cây trồng retrieved successfully',
			data: result.data,
			pagination: result.pagination,
		});
	} catch (error) {
		next(error);
	}
};

const createBuyingSeed = async (req, res, next) => {
	try {
		const {
			season_diary_id,
			purchase_date,
			seed_name,
			quantity,
			total_price,
			supplier_name,
			supplier_address,
		} = req.body;

		if (
			!season_diary_id ||
			!purchase_date ||
			!seed_name ||
			quantity === undefined ||
			total_price === undefined ||
			!supplier_name ||
			!supplier_address
		) {
			return res.status(400).json({
				code: 400,
				message:
					'season_diary_id, purchase_date, seed_name, quantity, total_price, supplier_name, and supplier_address are required',
			});
		}

		const userId = req.user?.id || req.user?._id;
		const created = await buyingSeedService.createBuyingSeed({
			userId,
			role: req.user?.role,
			data: req.body,
		});

		res.status(201).json({
			code: 201,
			message: 'Tạo nhật kí mua giống cây trồng thành công',
			data: created,
		});
	} catch (error) {
		next(error);
	}
};

const updateBuyingSeed = async (req, res, next) => {
	try {
		const { buying_seed_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		if (!Object.keys(req.body || {}).length) {
			return res.status(400).json({
				code: 400,
				message: 'No fields provided for update',
			});
		}

		const updated = await buyingSeedService.updateBuyingSeed({
			buyingSeedId: buying_seed_id,
			userId,
			role: req.user?.role,
			data: req.body,
		});

		res.status(200).json({
			code: 200,
			message: 'Cập nhật nhật kí mua giống cây trồng thành công',
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

const deleteBuyingSeed = async (req, res, next) => {
	try {
		const { buying_seed_id } = req.params;
		const userId = req.user?.id || req.user?._id;

		await buyingSeedService.deleteBuyingSeed({
			buyingSeedId: buying_seed_id,
			userId,
			role: req.user?.role,
		});

		res.status(200).json({
			code: 200,
			message: 'Xóa nhật kí mua giống cây trồng thành công',
		});
	} catch (error) {
		next(error);
	}
};

export const buyingSeedController = {
	viewBuyingSeedList,
	createBuyingSeed,
	updateBuyingSeed,
	deleteBuyingSeed,
};
