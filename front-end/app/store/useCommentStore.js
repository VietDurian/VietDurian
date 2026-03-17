import { create } from "zustand";
import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    try {
        const { useAuthStore } = require("./useAuthStore");
        const token = useAuthStore.getState?.()?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) { }
    return config;
});

const countComments = (list) => {
    let count = list.length;
    list.forEach((c) => {
        if (c.children?.length) count += countComments(c.children);
    });
    return count;
};

// Normalize bat ky shape nao tu API ve dang chuan
const buildReactionEntry = (raw, authUserId) => {
    // raw co the la: array, { data: array }, { reactions: array, breakdown, total }, { data: { reactions, breakdown, total } }
    let list = [];
    let breakdown = { like: 0, love: 0, haha: 0, angry: 0 };
    let total = 0;

    if (Array.isArray(raw)) {
        list = raw;
    } else if (raw && typeof raw === "object") {
        const inner = raw.data || raw;
        if (Array.isArray(inner)) {
            list = inner;
        } else if (inner && typeof inner === "object") {
            if (Array.isArray(inner.reactions)) list = inner.reactions;
            else if (Array.isArray(inner.data)) list = inner.data;
            if (inner.breakdown) breakdown = inner.breakdown;
            if (typeof inner.total === "number") total = inner.total;
        }
    }

    if (total === 0) total = list.length;

    const userRxn = list.find((r) => {
        const uid = typeof r.user_id === "object" ? r.user_id?._id : r.user_id;
        return uid === authUserId;
    });

    return {
        total,
        breakdown,
        reactions: list,
        userReaction: userRxn?.type || null,
        userReactionId: userRxn?._id || null,
    };
};

export const useCommentStore = create((set, get) => ({

    comments: [],
    reactions: {},
    commentsLoading: false,
    commentsError: null,
    totalCount: 0,

    fetchComments: async (postId, authUserId) => {
        set({ commentsLoading: true, commentsError: null });
        try {
            const res = await apiClient.get(`/comment/${postId}/post`, { params: { sort: "all" } });
            const data = res.data?.data || res.data || [];
            const total = countComments(data);
            set({ comments: data, totalCount: total, commentsLoading: false });

            const collectIds = (list) => {
                const ids = [];
                list.forEach((c) => {
                    ids.push(c._id);
                    if (c.children?.length) ids.push(...collectIds(c.children));
                });
                return ids;
            };
            const allIds = collectIds(data);

            const rxnResults = await Promise.allSettled(
                allIds.map((id) => apiClient.get(`/reaction/${id}/comment`))
            );

            const reactionsMap = {};
            rxnResults.forEach((result, i) => {
                const commentId = allIds[i];
                if (result.status === "fulfilled") {
                    reactionsMap[commentId] = buildReactionEntry(result.value.data, authUserId);
                } else {
                    reactionsMap[commentId] = {
                        total: 0,
                        breakdown: { like: 0, love: 0, haha: 0, angry: 0 },
                        reactions: [],
                        userReaction: null,
                        userReactionId: null,
                    };
                }
            });

            set({ reactions: reactionsMap });
        } catch (err) {
            set({
                commentsError: err?.response?.data?.message || err?.message || "Khong the tai binh luan",
                commentsLoading: false,
            });
        }
    },

    createComment: async (postId, content, parentId, authUserId) => {
        try {
            await apiClient.post("/comment", {
                post_id: postId,
                content: content.trim(),
                parent_id: parentId || null,
            });
            await get().fetchComments(postId, authUserId);
        } catch (err) {
            throw new Error(err?.response?.data?.message || err?.message || "Khong the dang binh luan");
        }
    },

    updateComment: async (postId, commentId, content, authUserId) => {
        try {
            await apiClient.patch(`/comment/${commentId}`, { content: content.trim() });
            await get().fetchComments(postId, authUserId);
        } catch (err) {
            throw new Error(err?.response?.data?.message || err?.message || "Khong the cap nhat binh luan");
        }
    },

    deleteComment: async (postId, commentId, authUserId) => {
        try {
            await apiClient.delete(`/comment/${commentId}`);
            await get().fetchComments(postId, authUserId);
        } catch (err) {
            throw new Error(err?.response?.data?.message || err?.message || "Khong the xoa binh luan");
        }
    },

    toggleReaction: async (commentId, type, authUserId) => {
        const { reactions } = get();
        const current = reactions[commentId] || {
            total: 0,
            breakdown: { like: 0, love: 0, haha: 0, angry: 0 },
            reactions: [],
            userReaction: null,
            userReactionId: null,
        };
        const prevType = current.userReaction;
        const prevId = current.userReactionId;

        // Optimistic update
        const newBreakdown = { ...current.breakdown };
        let newTotal = current.total;
        let newUserReaction = null;
        let newUserReactionId = null;

        if (prevType) {
            newBreakdown[prevType] = Math.max(0, (newBreakdown[prevType] || 0) - 1);
            newTotal = Math.max(0, newTotal - 1);
        }
        if (type && type !== prevType) {
            newBreakdown[type] = (newBreakdown[type] || 0) + 1;
            newTotal += 1;
            newUserReaction = type;
        }

        set({
            reactions: {
                ...reactions,
                [commentId]: {
                    ...current,
                    total: newTotal,
                    breakdown: newBreakdown,
                    userReaction: newUserReaction,
                    userReactionId: newUserReactionId,
                },
            },
        });

        try {
            if (prevId) {
                if (type && type !== prevType) {
                    await apiClient.patch(`/reaction/${prevId}`, { type });
                    set((state) => ({
                        reactions: {
                            ...state.reactions,
                            [commentId]: { ...state.reactions[commentId], userReactionId: prevId },
                        },
                    }));
                } else {
                    await apiClient.delete(`/reaction/${prevId}`);
                }
            } else if (type) {
                const res = await apiClient.post("/reaction", {
                    comment_id: commentId,
                    userId: authUserId,
                    type,
                });
                const newId = res.data?.data?._id || res.data?._id || null;
                set((state) => ({
                    reactions: {
                        ...state.reactions,
                        [commentId]: { ...state.reactions[commentId], userReactionId: newId },
                    },
                }));
            }
        } catch (_) {
            // Rollback
            set((state) => ({
                reactions: { ...state.reactions, [commentId]: current },
            }));
        }
    },

    reportComment: async (commentId, reason) => {
        await apiClient.post("/report-comment", {
            comment_id: commentId,
            reason: reason.trim(),
        });
    },

    clearComments: () =>
        set({ comments: [], reactions: {}, totalCount: 0, commentsError: null }),
}));