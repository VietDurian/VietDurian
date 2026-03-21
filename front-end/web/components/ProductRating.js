"use client";

import { useState, useEffect } from "react";
import { ratingAPI } from "@/lib/api";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductRating({ productId, userId }) {
    const { t } = useLanguage();
    const [userRating, setUserRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [userOwnRating, setUserOwnRating] = useState(null);
    const [otherReviews, setOtherReviews] = useState([]);

    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [isReviewDetailModalVisible, setIsReviewDetailModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);

    const [ratingContent, setRatingContent] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        if (productId) {
            fetchRatings();
        }
    }, [productId]);

    useEffect(() => {
        if (isRatingModalVisible || isReviewDetailModalVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isRatingModalVisible, isReviewDetailModalVisible]);

    const fetchRatings = async () => {
        try {
            const response = await ratingAPI.getRatingsByProductId(productId, {
                page: 1,
                limit: 100
            });

            if (response.success) {
                const avgRating = response.statistics?.averageRating;
                const avgRatingValue = typeof avgRating === 'string'
                    ? parseFloat(avgRating)
                    : parseFloat(avgRating || 0);

                setAverageRating(avgRatingValue);
                setTotalRatings(response.statistics?.totalRatings || 0);

                const ratingsData = response.data || [];
                const formattedReviews = ratingsData.map(rating => {
                    const userName = rating.user_id?.full_name || 'Anonymous';
                    const avatar = rating.user_id?.avatar || null;
                    const userIdValue = rating.user_id?._id || null;

                    const stars = rating.stars;
                    const starsValue = typeof stars === 'object' && stars?.$numberDecimal
                        ? parseFloat(stars.$numberDecimal)
                        : parseFloat(stars || 0);

                    const dateStr = rating.created_at || rating.createdAt;
                    const formattedDate = dateStr
                        ? new Date(dateStr).toLocaleDateString('vi-VN')
                        : 'Invalid Date';

                    return {
                        id: rating._id,
                        userName: userName,
                        avatar: avatar,
                        rating: starsValue,
                        comment: rating.content,
                        date: formattedDate,
                        userId: userIdValue,
                        rawData: rating
                    };
                });

                if (userId) {
                    const ownRating = formattedReviews.find(r => r.userId === userId);
                    const others = formattedReviews.filter(r => r.userId !== userId);

                    setUserOwnRating(ownRating || null);
                    setOtherReviews(others);
                } else {
                    setUserOwnRating(null);
                    setOtherReviews(formattedReviews);
                }
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
            toast.error(t('rating_toast_load_fail'));
        }
    };

    const handleSubmitRating = async (e) => {
        e.preventDefault();

        if (!ratingContent.trim() || ratingContent.trim().length < 10) {
            toast.error(t('rating_toast_min_content'));
            handleCloseRatingModal();
            return;
        }

        if (!userId) {
            toast.error(t('rating_toast_login'));
            handleCloseRatingModal();
            return;
        }

        if (userRating === 0) {
            toast.error(t('rating_toast_select_star'));
            return;
        }

        try {
            let response;

            if (isEditMode && editingRatingId) {
                response = await ratingAPI.updateRating(editingRatingId, {
                    stars: userRating,
                    content: ratingContent.trim()
                });
            } else {
                response = await ratingAPI.createRating({
                    productId,
                    stars: userRating,
                    content: ratingContent.trim()
                });
            }

            if (response.success) {
                toast.success(isEditMode ? t('rating_toast_update_success') : t('rating_toast_submit_success'));
                handleCloseRatingModal();
                await fetchRatings();
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error('Failed to submit rating:', err);
            toast.error(isEditMode ? t('rating_toast_update_fail') : t('rating_toast_already_rated'));
            handleCloseRatingModal();
        }
    };

    const handleDeleteRating = async (ratingId) => {
        if (!confirm(t('rating_confirm_delete'))) return;

        try {
            const response = await ratingAPI.deleteRating(ratingId);

            if (response.success) {
                toast.success(t('rating_toast_delete_success'));
                setIsReviewDetailModalVisible(false);
                await fetchRatings();
            }
        } catch (error) {
            console.error('Failed to delete rating:', error);
            toast.error(t('rating_toast_delete_fail'));
        }
    };

    const renderStars = (rating, isInteractive = false) => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isFilled = isInteractive
                ? (hoveredStar ? starValue <= hoveredStar : starValue <= userRating)
                : starValue <= Math.floor(rating);

            return (
                <span
                    key={index}
                    className={`inline-block transition-all ${isInteractive
                        ? 'text-5xl cursor-pointer hover:scale-110'
                        : 'text-xl'
                        } ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={isInteractive ? () => handleStarClick(starValue) : undefined}
                    onMouseEnter={isInteractive ? () => setHoveredStar(starValue) : undefined}
                    onMouseLeave={isInteractive ? () => setHoveredStar(0) : undefined}
                >
                    ★
                </span>
            );
        });
    };

    const handleStarClick = (rating) => {
        setUserRating(rating);
        setIsRatingModalVisible(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalVisible(false);
        setRatingContent('');
        setUserRating(0);
        setIsEditMode(false);
        setEditingRatingId(null);
    };

    const handleReviewCardClick = (review, isEdit = false) => {
        setSelectedReview(review);
        if (isEdit) {
            setIsEditMode(true);
            setEditingRatingId(review.id);
            setUserRating(review.rating);
            setRatingContent(review.comment);
            setIsRatingModalVisible(true);
        } else {
            setIsReviewDetailModalVisible(true);
        }
    };

    const handleCloseReviewDetailModal = () => {
        setIsReviewDetailModalVisible(false);
        setSelectedReview(null);
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-12">
            {/* Rating Section */}
            <div className="mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">{t('rating_title')}</h2>

                {/* Rating Overview */}
                <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
                    <div>
                        <div className="text-6xl font-bold text-gray-900 leading-none">
                            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {renderStars(averageRating)}
                        </div>
                        <div className="text-xl text-gray-600">
                            {totalRatings} {t('rating_count')}
                        </div>
                    </div>
                </div>

                {/* User Rating Input */}
                <div className="flex gap-3">
                    {renderStars(userRating, true)}
                </div>
            </div>

            {/* Reviews List */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-min">
                    {/* User's Own Rating */}
                    {userOwnRating && (
                        <div
                            className="flex-shrink-0 w-[320px] h-[140px] bg-white border-2 border-emerald-600 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
                            style={{ boxShadow: '3px 3px 0px #10b981' }}
                            onClick={() => handleReviewCardClick(userOwnRating, false)}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-base text-gray-900">
                                        {userOwnRating.userName}
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">
                                        {userOwnRating.date}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex gap-0.5">
                                        {renderStars(userOwnRating.rating)}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            className="p-1 border border-emerald-600 text-emerald-600 rounded hover:bg-emerald-50 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReviewCardClick(userOwnRating, true);
                                            }}
                                            title={t('rating_btn_edit_title')}
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            className="p-1 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRating(userOwnRating.id);
                                            }}
                                            title={t('rating_btn_delete_title')}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm overflow-hidden break-all line-clamp-1">
                                    {userOwnRating.comment}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Other Reviews */}
                    {otherReviews.length > 0 ? (
                        otherReviews.slice(0, userOwnRating ? 3 : 4).map((review) => (
                            <div
                                key={review.id}
                                className="flex-shrink-0 w-[320px] h-[140px] bg-white border-2 border-emerald-600 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
                                style={{ boxShadow: '3px 3px 0px #10b981' }}
                                onClick={() => handleReviewCardClick(review)}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-base text-gray-900">
                                            {review.userName}
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                            {review.date}
                                        </div>
                                    </div>

                                    <div className="flex gap-0.5 mb-2">
                                        {renderStars(review.rating)}
                                    </div>

                                    <p className="text-gray-400 text-sm overflow-hidden break-all line-clamp-1">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : !userOwnRating ? (
                        <div className="w-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <p className="text-lg">{t('rating_no_reviews')}</p>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Rating Modal */}
            {isRatingModalVisible && (
                <div
                    className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4 overflow-y-auto"
                    onClick={handleCloseRatingModal}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-xl my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-8 border-b border-gray-200">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {isEditMode ? t('rating_modal_title_edit') : t('rating_modal_title_new')}
                            </h2>
                            <button
                                className="text-gray-400 hover:text-gray-600 text-4xl leading-none"
                                onClick={handleCloseRatingModal}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-center gap-3 mb-8 pb-6 border-b border-gray-200">
                                {renderStars(userRating, true)}
                            </div>

                            <div className="mb-6">
                                <label className="block text-lg font-medium text-gray-600 mb-6">
                                    {t('rating_modal_label')}
                                </label>
                                <textarea
                                    className="w-full border-2 border-gray-300 rounded-lg p-4 text-lg focus:outline-none focus:border-emerald-500 bg-gray-50 resize-none text-gray-900"
                                    rows="5"
                                    placeholder={t('rating_modal_placeholder')}
                                    value={ratingContent}
                                    onChange={(e) => setRatingContent(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSubmitRating(e);
                                    }}
                                    className="flex-1 max-w-[200px] px-6 py-3 border-2 border-emerald-600 text-emerald-600 font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    {isEditMode ? t('rating_modal_update') : t('rating_modal_submit')}
                                </button>

                                {isEditMode && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCloseRatingModal();
                                            handleDeleteRating(editingRatingId);
                                        }}
                                        className="flex-1 max-w-[200px] px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        {t('rating_modal_delete')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Detail Modal */}
            {isReviewDetailModalVisible && selectedReview && (
                <div
                    className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4 overflow-y-auto"
                    onClick={handleCloseReviewDetailModal}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-xl my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-8 border-b border-gray-200">
                            <h2 className="text-3xl font-bold text-gray-900">{t('rating_detail_title')}</h2>
                            <button
                                className="text-gray-400 hover:text-gray-600 text-4xl leading-none"
                                onClick={handleCloseReviewDetailModal}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <div className="font-semibold text-2xl text-gray-900">
                                    {selectedReview.userName}
                                </div>
                                <div className="text-lg text-gray-500">
                                    {selectedReview.date}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {renderStars(selectedReview.rating)}
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 min-h-[150px]">
                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                    {selectedReview.comment}
                                </p>
                            </div>

                            {selectedReview.userId === userId && (
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            handleCloseReviewDetailModal();
                                            handleReviewCardClick(selectedReview, true);
                                        }}
                                        className="flex-1 px-6 py-3 border-2 border-emerald-600 text-emerald-600 font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                    >
                                        {t('rating_detail_edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRating(selectedReview.id)}
                                        className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                                    >
                                        {t('rating_detail_delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}