import { reportPostService } from '@/services/reportPostService';

// Get all reports
const getAllReport = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const result = await reportPostService.getAllReport(
			search,
			page || 1,
			limit || 10
		);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

// Create a new report
const createReport = async (req, res, next) => {
	try {
		const { post_id, reason, image } = req.body;

		// Validate input and reason lon hon 10 ky tu ko bao gom khoang trang
		if (!reason || reason.replace(/\s/g, '').length < 10) {
			return res.status(400).json({ message: 'Reason are required and must be at least 10 characters long.' });
		}
		const newReport = await reportPostService.createReport(
			post_id,
			reason,
			image,
			req.user.id
		);
		res.status(201).json({
			message: 'Report created successfully',
			report: newReport,
		});
	} catch (error) {
		next(error);
	}
};

// Update a report
const updateReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateReport = await reportPostService.updateReport(id);
        res.status(200).json({
            message: 'Report updated successfully',
            report: updateReport,
        });
    } catch (error) {
        next(error);
    }
}

// Delete a report
const deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleteReport = await reportPostService.deleteReport(id);
        res.status(200).json({
            message: 'Report deleted successfully',
            report: deleteReport,
        });
    } catch (error) {
        next(error);
    }
}

export const reportPostController = {
	getAllReport,
	createReport,
    updateReport,
    deleteReport,
};
