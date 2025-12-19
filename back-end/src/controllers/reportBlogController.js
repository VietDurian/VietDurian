import { reportBlogService } from '@/services/reportBlogService';

// Get all reports
const getAllReport = async (req, res, next) => {
	try {
		const { search, page, limit } = req.query;
		const result = await reportBlogService.getAllReport(
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
		const { blog_id, reason, image } = req.body;

		// Validate input and reason lon hon 10 ky tu ko bao gom khoang trang
		if (!reason || reason.replace(/\s/g, '').length < 10) {
			return res.status(400).json({ message: 'Reason are required and must be at least 10 characters long.' });
		}
		const newReport = await reportBlogService.createReport(
			blog_id,
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
        const updateReport = await reportBlogService.updateReport(id);
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
        const deleteReport = await reportBlogService.deleteReport(id);
        res.status(200).json({
            message: 'Report deleted successfully',
            report: deleteReport,
        });
    } catch (error) {
        next(error);
    }
}

export const reportBlogController = {
	getAllReport,
	createReport,
    updateReport,
    deleteReport,
};
