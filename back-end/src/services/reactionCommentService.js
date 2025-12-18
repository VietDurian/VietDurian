import { ReactionCommentModel } from '@/model/reactionCommentModel';

// Get all reaction comments
const getAllReactionComments = async () => {
	try {
		const reactions = await ReactionCommentModel.find().lean();
		return reactions;
	} catch (error) {
		throw error;
	}
};

// Add a reaction to a comment
const addReaction = async (payload) => {
	try {
		// Validate type
		const validTypes = [
			'like',
			'dislike',
			'love',
			'haha',
			'wow',
			'sad',
			'angry',
		];
		if (!validTypes.includes(payload.type)) {
			throw new Error('Invalid reaction type');
		}

		// Kiểm tra đã tồn tại reaction chưa
		const existing = await ReactionCommentModel.findOne({
			comment_id: payload.comment_id,
			user_id: payload.userId,
		});
		if (existing) {
			throw new Error('Reaction already exists for this comment and user');
		}
		const newReaction = new ReactionCommentModel({
			comment_id: payload.comment_id,
			user_id: payload.userId,
			type: payload.type,
		});
		const savedReaction = await newReaction.save();
		return savedReaction;
	} catch (error) {
		throw error;
	}
};

// Get reactions by comment ID
const getReactionCommentsByCommentId = async ({ commentId }) => {
	try {
		// Thống kê tổng số reaction và phân loại theo type theo comment ID
		const reactions = await ReactionCommentModel.find({
			comment_id: commentId,
		}).lean();

		const total = reactions.length;
		const breakdown = {
			like: 0,
			dislike: 0,
			love: 0,
			haha: 0,
			wow: 0,
			sad: 0,
			angry: 0,
		};

		reactions.forEach((reaction) => {
			if (breakdown[reaction.type] !== undefined) {
				breakdown[reaction.type]++;
			}
		});

		return {
			total,
			breakdown,
			reactions,
		};
	} catch (error) {
		throw error;
	}
};

// Update a reaction
const updateReaction = async ({ id, type }) => {
	try {
		const updatedReaction = await ReactionCommentModel.findByIdAndUpdate(
			id,
			{ type },
			{ new: true }
		);
		return updatedReaction;
	} catch (error) {
		throw error;
	}
};

// Delete a reaction
const deleteReaction = async ({ id }) => {
	try {
		const result = await ReactionCommentModel.findByIdAndDelete(id);
		return result;
	} catch (error) {
		throw error;
	}
};

export const reactionCommentService = {
	getAllReactionComments,
	addReaction,
	getReactionCommentsByCommentId,
	updateReaction,
	deleteReaction,
};
