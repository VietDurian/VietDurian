import { GeneralPostModel } from '@/model/generalPostModel';
import { cloudinary } from '@/config/cloudinary';
import { notificationService } from '@/services/notificationService';
import { favoriteService } from '@/services/favoriteService';
import User from '@/model/userModel';

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;

const normalizeText = (text = '') =>
	text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

// Create a new general post
const createGeneralPost = async ({
	author_id,
	category,
	title,
	content,
	image,
	contact,
}) => {
	try {
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

		const newPost = new GeneralPostModel({
			author_id,
			category,
			title,
			content,
			image: imageUrl,
			contact,
		});
		const savedPost = await newPost.save();
		return savedPost;
	} catch (error) {
		throw error;
	}
};

// Get general posts
const getGeneralPost = async ({
	status,
	category,
	search,
	sort,
	author_id,
}) => {
	try {
		const query = {};
		const sortOption = {};
		const shouldFilterBySearch = Boolean(search);
		const normalizedSearch = normalizeText(search || '');

		if (status) {
			query.status = status;
		}

		if (category) {
			query.category = category;
		}

		if (author_id) {
			query.author_id = author_id;
		}

		if (sort) {
			if (sort === 'newest') {
				sortOption.created_at = -1;
			} else if (sort === 'oldest') {
				sortOption.created_at = 1;
			}
		}

		// Apply sort via Mongoose `.sort()`; if no sort provided, no sort applied.
		const postsQuery = GeneralPostModel.find(query).populate({
			path: 'author_id',
			select: 'full_name avatar email',
		});

		const rawPosts = Object.keys(sortOption).length
			? await postsQuery.sort(sortOption).lean()
			: await postsQuery.lean();

		const postsWithAuthor = rawPosts
			.filter((post) => post.author_id) // Filter out posts with deleted/missing authors
			.map((post) => {
				const author = post.author_id;
				const normalizedAuthorId = author._id.toString();

				return {
					...post,
					author: {
						_id: author._id.toString(),
						full_name: author.full_name,
						avatar: author.avatar,
						email: author.email,
					},
					author_id: normalizedAuthorId,
				};
			});

		if (!shouldFilterBySearch) {
			return postsWithAuthor;
		}

		const filteredPosts = postsWithAuthor.filter((post) =>
			normalizeText(post.title || '').includes(normalizedSearch),
		);

		return filteredPosts;
	} catch (error) {
		throw error;
	}
};

// Update a general post
const updateGeneralPost = async (post_id, data) => {
	try {
		if (data.image) {
			try {
				const result = await cloudinary.uploader.upload(data.image, {
					folder: 'vietdurian',
				});
				data.image = result.secure_url;
			} catch (error) {
				throw new Error('Image upload failed');
			}
		}

		const updatedPost = await GeneralPostModel.findByIdAndUpdate(
			post_id,
			data,
			{ new: true },
		);
		return updatedPost;
	} catch (error) {
		throw error;
	}
};

// Delete a general post
const deleteGeneralPost = async (post_id) => {
	try {
		const del = await GeneralPostModel.findByIdAndDelete(post_id);
		if (del) {
			// Also delete related favorites
			await favoriteService.deleteFavoritesByPostId(post_id);
		}
	} catch (error) {
		throw error;
	}
};

// Approve a general post
const approveGeneralPost = async (post_id, adminId, status, reason) => {
	try {
		const updatedPost = await GeneralPostModel.findByIdAndUpdate(
			post_id,
			{ status: status },
			{ new: true },
		);

		if (status == 'active') {
			if (updatedPost) {
				try {
					const receiver_id = updatedPost.author_id;
					if (receiver_id && receiver_id.toString() !== adminId.toString()) {
						await notificationService.createNotification({
							receiver_id: receiver_id,
							sender_id: adminId,
							entity_type: 'Accepted Post',
							post_id: post_id,
							message: `Bài viết của bạn đã được admin ${status}.`,
						});
					}
				} catch (error) {
					console.error('Notification error:', error);
				}
			}
		} else if (status == 'inactive') {
			if (updatedPost) {
				try {
					const receiver_id = updatedPost.author_id;
					if (receiver_id && receiver_id.toString() !== adminId.toString()) {
						await notificationService.createNotification({
							receiver_id: receiver_id,
							sender_id: adminId,
							entity_type: 'Rejected Post',
							post_id: post_id,
							message: `Bài viết của bạn đã bị từ chối bởi admin.${reason}.`,
						});
					}
				} catch (error) {
					console.error('Notification error:', error);
				}
			}
		}

		return updatedPost;
	} catch (error) {
		throw error;
	}
};

// Get general post details
const getGeneralPostDetails = async (post_id) => {
	try {
		const post = await GeneralPostModel.findById(post_id).lean();
		return post;
	} catch (error) {
		throw error;
	}
};

const getSystemSenderId = async () => {
	const adminUser = await User.findOne({ role: 'admin' }).select('_id').lean();
	return adminUser?._id || null;
};

const expireUnapprovedPosts = async () => {
	try {
		const cutoffDate = new Date(Date.now() - TWO_DAYS_IN_MS);
		const expiredPosts = await GeneralPostModel.find({
			status: 'progressing',
			created_at: { $lte: cutoffDate },
		})
			.select('_id author_id created_at')
			.lean();

		if (!expiredPosts.length) {
			return { processed: 0 };
		}

		const senderId = await getSystemSenderId();

		for (const post of expiredPosts) {
			await GeneralPostModel.findByIdAndUpdate(post._id, { status: 'inactive' });

			if (post.author_id) {
				try {
					await notificationService.createNotification({
						receiver_id: post.author_id,
						sender_id: senderId || post.author_id,
						entity_type: 'Expired Post',
						post_id: post._id,
						message:
							'Bài viết của bạn đã hết hạn xét duyệt sau 2 ngày. Vui lòng đăng lại nếu bạn vẫn muốn chia sẻ thông tin này.',
					});
				} catch (error) {
					console.error('Notification error (expired post):', error);
				}
			}

			await deleteGeneralPost(post._id);
		}

		return { processed: expiredPosts.length };
	} catch (error) {
		throw error;
	}
};

const startPostExpiryJob = () => {
	const run = async () => {
		try {
			const result = await expireUnapprovedPosts();
			if (result.processed > 0) {
				console.log(`[PostExpiryJob] Processed ${result.processed} expired posts.`);
			}
		} catch (error) {
			console.error('[PostExpiryJob] Failed to process expired posts:', error);
		}
	};

	// Run once at startup to avoid waiting for the first interval.
	run();

	// Re-check periodically for posts that just crossed the 2-day threshold.
	setInterval(run, 60 * 60 * 1000);
};

export const postService = {
	createGeneralPost,
	getGeneralPost,
	updateGeneralPost,
	deleteGeneralPost,
	approveGeneralPost,
	getGeneralPostDetails,
	expireUnapprovedPosts,
	startPostExpiryJob,
};
