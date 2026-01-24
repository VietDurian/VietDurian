import { reportCommentService } from '@/services/reportCOmmentService';

// getAllReport
const getAllReport = async (req, res, next) => {
	try {
		const { status } = req.query || {};
		const resuilt = await reportCommentService.getAllReport(status);
		res.status(200).json(resuilt);
	} catch (error) {
		next(error);
	}
};

// createReport
const createReport = async (req, res, next) => {
	try {
		const { comment_id, reason } = req.body;
		const user_id = req.user.id;
		const newReport = await reportCommentService.createReport(
			comment_id,
			reason,
			user_id,
		);
		res.status(201).json({
			message: 'Report created successfully',
			report: newReport,
		});
	} catch (error) {
		next(error);
	}
};

// updateReport
const updateReport = async (req, res, next) => {
	try {
		const { status } = req.body;
		const { id } = req.params;
		const updateReport = await reportCommentService.updateReport(id, status);
		res.status(200).json({
			message: 'Report updated successfully',
			report: updateReport,
		});
	} catch (error) {
		next(error);
	}
};

// banComment
const banReport = async (req, res, next) => {
	try {
		//lay comment id
		const { id } = req.params;
		await reportCommentService.banReport(id);
		res.status(200).json({
			message: 'Report banned successfully',
		});
	} catch (error) {
		next(error);
	}
};
export const reportCommentController = {
	getAllReport,
	createReport,
	updateReport,
	banReport,
};
