import { ReportBlogModel as reportBlogModel } from '@/model/reportBlogModel.js';
import { cloudinary } from '@/config/cloudinary.js';

// Get all reports
export const getAllReport = async (search, page = 1, limit = 10) => {
	const skip = (page - 1) * limit;
	let reports = [];
	let total = 0;

	if (search) {
		let query = reportBlogModel
			.find()
			.populate('user_id', 'full_name')
			.populate('blog_id', 'title');

		const allReports = await query.lean();

		const filteredReports = allReports.filter((report) =>
			report.blog_id?.title?.toLowerCase().includes(search.toLowerCase())
		);

		total = filteredReports.length;
		reports = filteredReports.slice(skip, skip + limit);
	} else {
		total = await reportBlogModel.countDocuments();
		reports = await reportBlogModel
			.find()
			.populate('user_id', 'full_name')
			.populate('blog_id', 'title')
			.skip(skip)
			.limit(limit)
			.lean();
	}

	return {
		data: reports,
		total,
		currentPage: Number(page),
		totalPages: Math.ceil(total / limit),
	};
};

// Create a new report
export const createReport = async (blog_id, reason, image, user_id) => {
	let imageUrl = '';
	if (image) {
		try {
			const result = await cloudinary.uploader.upload(image, {
				folder: 'vietdurian',
			});
			imageUrl = result.secure_url;
		} catch (error) {
			throw new Error('Image upload failed');
		}
	}

	const newReport = new reportBlogModel({
		blog_id,
		user_id,
		reason,
		image: imageUrl,
	});
	await newReport.save();
	return newReport;
};

// Update a report
export const updateReport = async (id) => {
	const report = await reportBlogModel.findByIdAndUpdate(
		id,
		{ status: 'Resolved' },
		{ new: true }
	);
	return report;
};

// Delete a report
export const deleteReport = async (id) => {
	const report = await reportBlogModel.findByIdAndDelete(id);
	return report;
};

export const reportBlogService = {
	getAllReport,
	createReport,
	updateReport,
	deleteReport,
};
