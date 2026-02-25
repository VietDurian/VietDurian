"use client";
import { X, Heart, ThumbsUp, Smile, Angry, Send, Flag } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { commentAPI, reactionCommentAPI, reportCommentAPI } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const REACTION_TYPES = ["like", "love", "haha", "angry"];

const getReactionIcon = (type, size = 18, filled = false) => {
  const iconProps = { size, strokeWidth: 2 };

  switch (type) {
    case "like":
      return (
        <ThumbsUp
          {...iconProps}
          className={filled ? "fill-blue-500 text-blue-500" : "text-blue-500"}
        />
      );
    case "love":
      return (
        <Heart
          {...iconProps}
          className={filled ? "fill-red-500 text-red-500" : "text-red-500"}
        />
      );
    case "haha":
      return <Smile {...iconProps} className="text-yellow-500" />;
    case "angry":
      return <Angry {...iconProps} className="text-orange-600" />;
    default:
      return null;
  }
};

const getReactionColor = (type) => {
  switch (type) {
    case "like":
      return "text-blue-500";
    case "love":
      return "text-red-500";
    case "haha":
      return "text-yellow-500";
    case "angry":
      return "text-orange-600";
    default:
      return "text-gray-500";
  }
};

const getReactionLabel = (type) => {
  switch (type) {
    case "like":
      return "Like";
    case "love":
      return "Love";
    case "haha":
      return "Haha";
    case "angry":
      return "Angry";
    default:
      return "";
  }
};

const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
};

// Report Modal Component
const ReportCommentModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <Flag size={18} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Báo cáo bình luận</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Vui lòng cho chúng tôi biết lý do bạn báo cáo bình luận này. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do báo cáo..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent min-h-[100px] max-h-[200px]"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={() => onSubmit(reason)}
            disabled={!reason.trim() || isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi báo cáo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reaction Modal Component
const ReactionModal = ({ isOpen, onClose, commentId, reactions }) => {
  if (!isOpen || !commentId || !reactions[commentId]) return null;

  const commentReactions = reactions[commentId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Reactions</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Reaction Stats */}
        <div className="flex flex-wrap gap-4 p-5 justify-center border-b border-gray-200">
          {Object.entries(commentReactions.breakdown || {}).map(
            ([type, count]) =>
              count > 0 ? (
                <div key={type} className="flex flex-col items-center gap-1">
                  {getReactionIcon(type, 24, true)}
                  <span className="text-sm font-semibold text-gray-900">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getReactionLabel(type)}
                  </span>
                </div>
              ) : null,
          )}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-5">
          {commentReactions.reactions?.map((reaction) => {
            // Xử lý cả trường hợp user_id là object hoặc string
            const userInfo =
              typeof reaction.user_id === "object" ? reaction.user_id : null;
            const avatar = userInfo?.avatar || "/images/avatar.jpg";
            const displayName =
              userInfo?.full_name || userInfo?.username || "Unknown User";

            return (
              <div key={reaction._id} className="flex items-center gap-3 py-2">
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-9 h-9 rounded-full"
                />
                <span className="flex-1 text-sm font-medium text-gray-900">
                  {displayName}
                </span>
                <div className="w-6 h-6 flex items-center justify-center">
                  {getReactionIcon(reaction.type, 16, true)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  isReply = false,
  authUser,
  onReply,
  onEdit,
  onDelete,
  onReport,
  reactions,
  onReactionPress,
  showReactionOptions,
  toggleReactionOptions,
  onShowReactionModal,
}) => {
  const router = useRouter();
  // Kiểm tra author_id có thể là object hoặc string
  const authorId =
    typeof comment.author_id === "object"
      ? comment.author_id?._id
      : comment.author_id;
  const isOwnComment = authorId === authUser?._id;

  const userName =
    comment.author_id?.full_name ||
    comment.author_id?.username ||
    "Unknown User";
  const avatarUrl = comment.author_id?.avatar;

  const commentReactions = reactions[comment._id];
  // FIX: Kiểm tra cả trường hợp user_id là object hoặc string
  const userReaction = commentReactions?.reactions?.find((r) => {
    const reactionUserId =
      typeof r.user_id === "object" ? r.user_id?._id : r.user_id;
    return reactionUserId === authUser?._id;
  });

  const getMostReactedType = (breakdown) => {
    if (!breakdown) return null;
    const entries = Object.entries(breakdown);
    if (entries.length === 0) return null;
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][1] > 0 ? sorted[0][0] : null;
  };

  const mostReacted = getMostReactedType(commentReactions?.breakdown);

  return (
    <div
      className={`flex gap-3 mb-4 ${isReply ? "ml-12 pl-4 border-l-2 border-gray-100" : ""}`}
    >
      {/* Avatar */}
      <img
        src={avatarUrl || "/images/avatar.jpg"}
        alt={userName}
        className="w-10 h-10 rounded-full flex-shrink-0 mt-2.5 cursor-pointer"
        onClick={() => {
          const id = typeof comment.author_id === "object"
            ? comment.author_id?._id
            : comment.author_id;
          if (id) router.push(`/profile/${id}`);
        }}
      />

      {/* Comment Content */}
      <div className="flex-1">
        <div className="bg-gray-50 rounded-2xl px-4 py-2.5 inline-block max-w-full">
          <p className="font-semibold text-sm text-gray-900">{userName}</p>
          <p className="text-sm text-gray-700 mt-1 break-words">
            {comment.content}
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-5 mt-1.5 ml-3 text-xs relative">
          <span className="text-gray-400">
            {getTimeAgo(comment.created_at)}
          </span>

          {/* Like/Reaction Button */}
          {!userReaction ? (
            <button
              onClick={() => toggleReactionOptions(comment._id)}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Thích
            </button>
          ) : (
            <button
              onClick={() => toggleReactionOptions(comment._id)}
              className={`font-medium ${getReactionColor(userReaction.type)}`}
            >
              {getReactionLabel(userReaction.type)}
            </button>
          )}

          {/* Reaction Options Popup */}
          {showReactionOptions[comment._id] && (
            <div className="absolute bottom-6 left-7 bg-white rounded-full shadow-lg px-2 py-1.5 flex gap-2 z-10 border border-gray-100">
              {REACTION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => onReactionPress(comment._id, type)}
                  className="hover:scale-110 transition-transform p-1"
                >
                  {getReactionIcon(type, 20)}
                </button>
              ))}
              {userReaction && (
                <button
                  onClick={() =>
                    onReactionPress(comment._id, userReaction.type)
                  }
                  className="hover:scale-110 transition-transform p-1 border-l border-gray-200 pl-2"
                >
                  <X size={18} className="text-red-500" />
                </button>
              )}
            </div>
          )}

          {/* Reaction Summary - Clickable to show modal */}
          {commentReactions && commentReactions.total > 0 && (
            <button
              onClick={() => onShowReactionModal(comment._id)}
              className="flex items-center gap-1 hover:underline"
            >
              {mostReacted && (
                <div className="w-4 h-4 flex items-center justify-center">
                  {getReactionIcon(mostReacted, 14, true)}
                </div>
              )}
              <span className="text-gray-500 text-xs">
                {commentReactions.total}
              </span>
            </button>
          )}

          {/* Reply Button (only for root comments) */}
          {!isReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Trả lời
            </button>
          )}

          {/* Edit & Delete for own comments */}
          {isOwnComment && (
            <>
              <button
                onClick={() => onEdit(comment)}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => onDelete(comment._id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Xóa
              </button>
            </>
          )}

          {/* Report button for other's comments */}
          {!isOwnComment && (
            <button
              onClick={() => onReport(comment._id)}
              className="text-orange-500 hover:text-orange-700 font-medium"
            >
              Báo cáo
            </button>
          )}
        </div>

        {/* Render Child Comments (Replies) */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-3">
            {comment.children.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                isReply={true}
                authUser={authUser}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
                reactions={reactions}
                onReactionPress={onReactionPress}
                showReactionOptions={showReactionOptions}
                toggleReactionOptions={toggleReactionOptions}
                onShowReactionModal={onShowReactionModal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  post,
  onCommentCountChange,
}) {
  const { authUser } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState({});
  const [totalComment, setTotalComment] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReactionOptions, setShowReactionOptions] = useState({});
  const [reactionModalCommentId, setReactionModalCommentId] = useState(null);

  // Report states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const textInputRef = useRef(null);

  // Load comments khi mở modal
  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await commentAPI.getCommentsByPost(postId, "all");

      if (response.data) {
        setComments(response.data);

        // Hàm đệ quy để đếm tổng số comment (bao gồm cả replies)
        const countComments = (commentsList) => {
          let count = commentsList.length;
          commentsList.forEach((comment) => {
            if (comment.children && comment.children.length > 0) {
              count += countComments(comment.children);
            }
          });
          return count;
        };

        // Tính tổng comment
        const total = countComments(response.data);
        setTotalComment(total);

        // CẬP NHẬT SỐ COMMENT RA NGOÀI POST (component cha)
        if (onCommentCountChange) {
          onCommentCountChange(total);
        }

        // Load reactions cho tất cả comments (đệ quy)
        const loadReactionsRecursive = async (commentsList) => {
          for (const comment of commentsList) {
            await loadReactions(comment._id);
            if (comment.children && comment.children.length > 0) {
              await loadReactionsRecursive(comment.children);
            }
          }
        };
        await loadReactionsRecursive(response.data);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReactions = async (commentId) => {
    try {
      const response =
        await reactionCommentAPI.getReactionsByComment(commentId);
      if (response.data) {
        setReactions((prev) => ({
          ...prev,
          [commentId]: {
            total: response.data.total || 0,
            breakdown: response.data.breakdown || {},
            reactions: response.data.reactions || [],
          },
        }));
      }
    } catch (error) {
      console.error("Failed to load reactions:", error);
    }
  };

  const toggleReactionOptions = (commentId) => {
    setShowReactionOptions((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReactionPress = async (commentId, reactionType) => {
    const commentReactions = reactions[commentId];
    const userReaction = commentReactions?.reactions?.find(
      (r) => r.user_id?._id === authUser?._id || r.user_id === authUser?._id,
    );

    try {
      if (userReaction) {
        if (userReaction.type === reactionType) {
          // Remove reaction
          await reactionCommentAPI.deleteReaction(userReaction._id);
        } else {
          // Update reaction
          await reactionCommentAPI.updateReaction(
            userReaction._id,
            reactionType,
          );
        }
      } else {
        // Add new reaction - GỬI userId thay vì user_id
        await reactionCommentAPI.addReaction({
          comment_id: commentId,
          userId: authUser._id, // ĐỔI TỪ user_id THÀNH userId
          type: reactionType,
        });
      }

      // Reload reactions
      await loadReactions(commentId);
      setShowReactionOptions((prev) => ({ ...prev, [commentId]: false }));
    } catch (error) {
      console.error("Failed to handle reaction:", error);
      alert("Failed to update reaction. Please try again.");
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
    setCommentText("");
    textInputRef.current?.focus();
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
    setCommentText(comment.content);
    textInputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setCommentText("");
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !commentText.trim()) return;

    try {
      await commentAPI.updateComment(editingComment._id, commentText.trim());
      await loadComments();
      setEditingComment(null);
      setCommentText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !authUser?._id) return;

    try {
      const newCommentData = {
        post_id: postId,
        content: commentText.trim(),
        parent_id: replyingTo?._id || null,
      };

      await commentAPI.createComment(newCommentData);
      await loadComments();

      setCommentText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (
      !confirm(
        "Are you sure you want to delete this comment? All replies will also be deleted.",
      )
    ) {
      return;
    }

    try {
      await commentAPI.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  // Open report modal
  const handleReportComment = (commentId) => {
    setReportCommentId(commentId);
    setReportModalOpen(true);
  };

  // Submit report
  const handleSubmitReport = async (reason) => {
    if (!reason.trim()) return;

    setIsSubmittingReport(true);
    try {
      await reportCommentAPI.createReport({
        comment_id: reportCommentId,
        reason: reason.trim(),
      });
      setReportModalOpen(false);
      setReportCommentId(null);
      alert("Báo cáo đã được gửi thành công. Cảm ơn bạn!");
    } catch (error) {
      console.error("Failed to report comment:", error);
      alert("Không thể gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Bình Luận</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  authUser={authUser}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDeleteComment}
                  onReport={handleReportComment}
                  reactions={reactions}
                  onReactionPress={handleReactionPress}
                  showReactionOptions={showReactionOptions}
                  toggleReactionOptions={toggleReactionOptions}
                  onShowReactionModal={setReactionModalCommentId}
                />
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            {/* Replying Banner */}
            {replyingTo && (
              <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 mb-3">
                <p className="text-sm text-gray-700">
                  Trả lời bình luận của{" "}
                  <span className="font-semibold">
                    {replyingTo.author_id?.full_name ||
                      replyingTo.author_id?.username}
                  </span>
                </p>
                <button
                  onClick={handleCancelReply}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Editing Banner */}
            {editingComment && (
              <div className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2 mb-3">
                <p className="text-sm text-gray-700 font-medium">
                  Chỉnh sửa bình luận
                </p>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-start gap-3">
              <img
                src={authUser?.avatar || "/images/avatar.jpg"}
                alt="Your avatar"
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1 relative">
                <textarea
                  ref={textInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    editingComment
                      ? "Edit your comment..."
                      : replyingTo
                        ? `Reply to ${replyingTo.author_id?.username || "authUser"}...`
                        : "Viết bình luận..."
                  }
                  className="w-full bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-black resize-none focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white border border-gray-300 min-h-[44px] max-h-[120px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      editingComment ? handleSaveEdit() : handleSendComment();
                    }
                  }}
                />
              </div>
              <button
                onClick={editingComment ? handleSaveEdit : handleSendComment}
                disabled={!commentText.trim()}
                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 rounded-full transition flex-shrink-0"
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reaction Modal */}
      <ReactionModal
        isOpen={!!reactionModalCommentId}
        onClose={() => setReactionModalCommentId(null)}
        commentId={reactionModalCommentId}
        reactions={reactions}
      />

      {/* Report Modal */}
      <ReportCommentModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportCommentId(null);
        }}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
      />
    </>
  );
}