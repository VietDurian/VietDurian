import { ReportCommentModel } from '@/model/reportCommentModel';
import { CommentPostModel } from '@/model/commentPostModel';

// getAllReport
const getAllReport = async (filter) => {
	try {
		// filter may be a string (status) or an object like { status }
		let status = undefined;
		if (typeof filter === 'string') status = filter;
		else if (filter && typeof filter === 'object') status = filter.status;

		const query = {};
		if (status && status !== 'all') {
			query.status = status;
		}

		const reports = await ReportCommentModel.find(query)
			.populate('comment_id', 'content')
			.populate('user_id', 'full_name avatar')
			.lean();

		return reports;
	} catch (error) {
		throw error;
	}
};

// createReport
const createReport = async (comment_id, reason, user_id) => {
	try {
		const newReport = new ReportCommentModel({
			comment_id,
			reason,
			user_id,
		});
		await newReport.save();
		return newReport;
	} catch (error) {
		throw error;
	}
};

// updateReport
const updateReport = async (id, status) => {
	try {
		const report = await ReportCommentModel.findByIdAndUpdate(
			id,
			{ status },
			{ new: true },
		);
		return report;
	} catch (error) {
		throw error;
	}
};

// banReport
const banReport = async (id) => {
	try {
		// Mark the reported comment and all its descendants as inactive
		const report = await ReportCommentModel.findById(id);
		if (!report) {
			throw new Error('Report not found');
		}

		const rootCommentId = report.comment_id;
		const queue = [rootCommentId];
		const updatedIds = [];

		while (queue.length) {
			const currentId = queue.shift();
			const updated = await CommentPostModel.findByIdAndUpdate(
				currentId,
				{ is_active: 'inactive' },
				{ new: true },
			);
			if (updated) updatedIds.push(updated._id);

			const children = await CommentPostModel.find({ parent_id: currentId })
				.select('_id')
				.lean();
			children.forEach((c) => queue.push(c._id));
		}

		return updatedIds;
	} catch (error) {
		throw error;
	}
};

export const reportCommentService = {
	getAllReport,
	createReport,
	updateReport,
	banReport,
};
