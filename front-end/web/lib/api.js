import axios from "axios";

// Cấu hình base URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Function lấy token
const getToken = () => {
  if (typeof window !== "undefined") {
    // Ưu tiên token user đăng nhập
    const authToken = localStorage.getItem("auth_token");
    if (authToken) return authToken;

    // Sau đó dùng api_token
    const apiToken = localStorage.getItem("api_token");
    if (apiToken) return apiToken;
  }
  return null;
};

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Garden API
export const gardenAPI = {
  async getGardensForMap() {
    const response = await apiClient.get("/season-diary/map");
    return response.data;
  },
};

// Interceptor để tự động thêm token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor để xử lý lỗi response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getToken();
      if (token) {
        // Chỉ log khi có token mà vẫn bị 401 (token thực sự hết hạn)
        console.error("Token hết hạn hoặc không hợp lệ");
      }
      // Nếu không có token = đã logout rồi, bỏ qua silently
    }
    return Promise.reject(error);
  },
);

// AI API
export const aiAPI = {
  async predictDisease(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    // Override default JSON header for multipart.
    const response = await apiClient.post("/ai/predict", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// User API
export const usersAPI = {
  async getAllUsers(params = { page: 1, limit: 10 }) {
    const response = await apiClient.get("/user", { params });
    return response.data;
  },
  async getUserById(id) {
    const response = await apiClient.get(`/user/${id}`);
    console.log("aaaaaaaaaaaaaaaaaResponse from getUserById:", response.data);

    return response.data;
  },
  async toggleBanUser(id, is_banned) {
    const response = await apiClient.patch(`/user/ban/${id}`, { is_banned });
    return response.data;
  },
  async searchUsers(keyword, params = {}) {
    const response = await apiClient.get(`/user/search/${keyword}`, {
      params: { keyword, ...params },
    });
    return response.data;
  },
  async filterUsers(filters = {}) {
    const response = await apiClient.get("/user/filter", {
      params: filters,
    });
    return response.data;
  },
  async sortUsers(sortBy, sortOrder = "desc", params = {}) {
    const response = await apiClient.get("/user/sort", {
      params: { sortBy, sortOrder, ...params },
    });
    return response.data;
  },
};
//Permission API
export const permissionAPI = {
  async getAllPermissions(params = {}) {
    const response = await apiClient.get("/permission/requests", { params });
    return response.data;
  },

  async getPermissionById(id) {
    const response = await apiClient.get(`/permission/requests/${id}`);
    return response.data;
  },

  async searchPermissions(keyword, params = {}) {
    const response = await apiClient.get("/permission/requests/search", {
      params: { keyword, ...params },
    });
    return response.data;
  },

  async sortPermissions(verify_cccd = "pending", sort = "desc") {
    const response = await apiClient.get("/permission/requests/sort", {
      params: { verify_cccd, sort },
    });
    return response.data;
  },

  async rejectPermissionRequest(id, reason) {
    const response = await apiClient.patch(`/permission/requests/${id}/reject`, {
      reason,
    });
    return response.data;

  },

  async approvePermissionRequest(id) {
    const response = await apiClient.patch(`/permission/requests/${id}/confirm`);
    console.log("Response from approvePermissionRequest:", response.data);
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  async getMe() {
    const response = await apiClient.get("/profile/me");
    return response.data;
  },
  async update(payload) {
    const response = await apiClient.put("/profile/update", payload);
    return response.data;
  },

  async getPublicProfile(userId) {
    const response = await apiClient.get(`/profile/public/${userId}`);
    return response.data;
  },
};

// Auth API
export const authAPI = {
  async changePassword(payload) {
    const response = await apiClient.post("/auth/change-password", payload);
    return response.data;
  },
};

//Product Type of Admin management API
export const productTypesAPI = {
  async getAllProductTypes(params = {}) {
    const response = await apiClient.get("type-product", { params });
    return response.data;
  },
  async getProductTypeById(id) {
    const response = await apiClient.get(`type-product/${id}`);
    return response.data;
  },
  async createProductType(data) {
    const response = await apiClient.post("type-product", data);
    return response.data;
  },
  async updateProductType(id, data) {
    const response = await apiClient.patch(`type-product/${id}`, data);
    return response.data;
  },
  async deleteProductType(id) {
    const response = await apiClient.delete(`type-product/${id}`);
    return response.data;
  },
  async filterProductTypes(filters = {}) {
    const response = await apiClient.get("type-product/filter", {
      params: filters,
    });
    return response.data;
  },
};

//Product of Admin management API
export const productsAdminAPI = {
  async getAllProducts(params = {}) {
    const response = await apiClient.get("admin/products", { params });
    return response.data;
  },
  async getProductById(id) {
    const response = await apiClient.get(`admin/products/${id}`);
    return response.data;
  },
  async deleteProduct(id) {
    const response = await apiClient.patch(`admin/products/${id}`);
    return response.data;
  },
  async searchProducts(keyword, params = {}) {
    const response = await apiClient.get("admin/products/search", {
      params: { keyword, ...params },
    });
    return response.data;
  },
  async filterProducts(filters = {}) {
    const response = await apiClient.get("admin/products/filter", {
      params: filters,
    });
    return response.data;
  },
  async sortProducts(sortBy, sortOrder = "desc", params = {}) {
    const response = await apiClient.get("admin/products/sort", {
      params: { sortBy, sortOrder, ...params },
    });
    return response.data;
  },
};

// Blog API
export const blogAPI = {
  // Lấy tất cả blog
  async getAllBlogs(params = {}) {
    try {
      const response = await apiClient.get("/blog/knowledge", { params });
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error fetching blogs:", error);
      }
      throw error;
    }
  },

  // Lấy chi tiết blog theo ID
  async getBlogById(id) {
    try {
      const response = await apiClient.get(`/blog/knowledge/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog detail:", error);
      throw error;
    }
  },

  // Tìm kiếm blog
  async searchBlogs(searchTerm) {
    try {
      const response = await apiClient.get("/blog/knowledge", {
        async confirmPermission(id) {
          const response = await apiClient.post(
            `permission/requests/${id}/confirm`,
          );
          return response.data;
        },
        async rejectPermission(id, reason = "") {
          const response = await apiClient.post(
            `permission/requests/${id}/reject`,
            { reason },
          );
          return response.data;
        },
        params: { search: searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching blogs:", error);
      throw error;
    }
  },

  // Delete blog
  async deleteBlog(blogId) {
    try {
      const response = await apiClient.delete(`/blog/knowledge/${blogId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog:", error);
      throw error;
    }
  },

  // Tạo blog mới
  async createBlog(data) {
    try {
      const response = await apiClient.post("/blog/knowledge", data);
      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error;
    }
  },

  // Cập nhật blog
  async updateBlog(blogId, data) {
    try {
      const response = await apiClient.patch(`/blog/knowledge/${blogId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating blog:", error);
      throw error;
    }
  },

  // Thêm knowledge block vào blog
  async addKnowledgeBlock(blogId, blockData) {
    try {
      const response = await apiClient.post(`/blog/knowledge/${blogId}/block`, blockData);
      return response.data;
    } catch (error) {
      console.error("Error adding knowledge block:", error);
      throw error;
    }
  },

  // Cập nhật knowledge block
  async updateKnowledgeBlock(blockId, blockData) {
    try {
      const response = await apiClient.patch(`/blog/knowledge/block/${blockId}`, blockData);
      return response.data;
    } catch (error) {
      console.error("Error updating knowledge block:", error);
      throw error;
    }
  },

  // Xóa knowledge block
  async deleteKnowledgeBlock(blockId) {
    try {
      const response = await apiClient.delete(`/blog/knowledge/block/${blockId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting knowledge block:", error);
      throw error;
    }
  },

  // Lấy blog của user hiện tại (thêm filter author_id)
  async getMyBlogs() {
    try {
      const response = await apiClient.get("/blog/knowledge", {
        params: { sort: "newest" }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching my blogs:", error);
      throw error;
    }
  }
};

// Product API
export const productAPI = {
  // Lấy tất cả sản phẩm với filter, search, sort
  async getAllProducts(params = {}) {
    try {
      const response = await apiClient.get("/products", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Lấy dữ liệu sản phẩm cho market trend chart
  async getProductsForChart() {
    try {
      const response = await apiClient.get("/products", {
        params: { limit: 1000 } // Lấy nhiều data để tính toán
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products for chart:", error);
      throw error;
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm
  async searchProducts(keyword, params = {}) {
    try {
      const response = await apiClient.get("/products/search", {
        params: { keyword, ...params },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  // Lọc sản phẩm
  async filterProducts(filters = {}) {
    try {
      const response = await apiClient.get("/products/filter", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error filtering products:", error);
      throw error;
    }
  },

  // Sắp xếp sản phẩm
  async sortProducts(sortBy, sortOrder = "desc", params = {}) {
    try {
      const response = await apiClient.get("/products/sort", {
        params: { sortBy, sortOrder, ...params },
      });
      return response.data;
    } catch (error) {
      console.error("Error sorting products:", error);
      throw error;
    }
  },
};

// Product Type API
export const productTypeAPI = {
  // Lấy tất cả loại sản phẩm
  async getAllProductTypes(params = {}) {
    try {
      const response = await apiClient.get("/type-product", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching product types:", error);
      throw error;
    }
  },
};

// Rating API
export const ratingAPI = {
  // Lấy tất cả ratings cho một sản phẩm (bao gồm statistics)
  async getRatingsByProductId(productId, params = {}) {
    try {
      const response = await apiClient.get(`/ratings/product/${productId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      throw error;
    }
  },

  // Lấy rating của user hiện tại cho một sản phẩm
  async getMyRatingForProduct(productId) {
    try {
      const response = await apiClient.get(
        `/ratings/product/${productId}/my-rating`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user rating:", error);
      throw error;
    }
  },

  // Tạo rating mới
  async createRating(data) {
    try {
      const response = await apiClient.post("/ratings", data);
      return response.data;
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  },

  // Cập nhật rating
  async updateRating(ratingId, data) {
    try {
      const response = await apiClient.put(`/ratings/${ratingId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  },

  // Xóa rating
  async deleteRating(ratingId) {
    try {
      const response = await apiClient.delete(`/ratings/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  },

  // Lấy tất cả ratings của user hiện tại
  async getMyAllRatings(params = {}) {
    try {
      const response = await apiClient.get("/ratings/user/my-ratings", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      throw error;
    }
  },
};

// Get own posts
export async function getOwnPosts(filters = {}) {
  const { status, category, search, sort, author_id } = filters;

  // Build query string safely
  const params = new URLSearchParams();

  if (status && status !== "--") params.append("status", status);
  if (category && category !== "--") params.append("category", category);
  if (search) params.append("search", search);
  if (sort) params.append("sort", sort);
  if (author_id) params.append("author_id", author_id);

  const url = `/post/general${params.toString() ? `?${params.toString()}` : ""
    }`;

  try {
    const response = await apiClient.get(url);
    return response?.data?.data || [];
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch posts";
    throw new Error(message);
  }
}

// Create new post
export async function createPost({ category, title, content, image, contact }) {
  const params = { category, title, content, image, contact };
  try {
    const response = await apiClient.post("/post/general", params);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create post";
    throw new Error(message);
  }
}

// Delete post
export async function deletePost(postId) {
  try {
    const response = await apiClient.delete(`/post/${postId}/general`);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete post";
    throw new Error(message);
  }
}

// Update post
export async function updatePost(postId, { category, title, content, image, contact }) {
  try {
    const params = { category, title, content, image, contact };
    const response = await apiClient.patch(`/post/${postId}/general`, params);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update post";
    throw new Error(message);
  }
}

// Update post status become inactive
export async function setPostInactive(postId) {
  try {
    const status = { status: "inactive" };
    const response = await apiClient.patch(`/post/${postId}/general`, status);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update post status";
    throw new Error(message);
  }
}

// Update post status become active
export async function setPostActive(postId) {
  try {
    const status = { status: "active" };
    const response = await apiClient.patch(`/post/${postId}/general`, status);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update post status";
    throw new Error(message);
  }
}

// Approve post
export async function approvePost(postId, status, reason) {
  try {
    const param = { status, reason };
    const response = await apiClient.patch(
      `/post/${postId}/approve-general`,
      param,
    );
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to approve post";
    throw new Error(message);
  }
}

// Report post
export async function getAllReport(params) {
  try {
    const response = await apiClient.get("/report", params);
    return response?.data?.data || [];
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch reports";
    throw new Error(message);
  }
}

// Update report
export async function updateReport(reportId) {
  try {
    const response = await apiClient.patch(`/report/${reportId}`);
    return response?.data?.report || response?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update report";
    throw new Error(message);
  }
}

// Delete report
export async function deleteReport(reportId) {
  try {
    const response = await apiClient.delete(`/report/${reportId}`);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete report";
    throw new Error(message);
  }
}

// get all report comment
export async function getAllReportComment(params) {
  try {
    const response = await apiClient.get("/report-comment", { params });
    // backend returns either an array or an object { data: [] }
    return response?.data?.data ?? response?.data ?? [];
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch comment reports";
    throw new Error(message);
  }
}

// update report comment
export async function updateReportComment(reportId, status) {
  try {
    const response = await apiClient.patch(`/report-comment/${reportId}`, {
      status,
    });
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update comment report";
    throw new Error(message);
  }
}

// ban report comment
export async function banReportComment(reportId) {
  try {
    const response = await apiClient.patch(`/report-comment/ban/${reportId}`);
    return response?.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to ban comment report";
    throw new Error(message);
  }
}

// Comment API
export const commentAPI = {
  // Get all comments
  async getAllComments() {
    try {
      const response = await apiClient.get("/comment");
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Get comments by Post ID
  async getCommentsByPost(postId, sort = "all") {
    try {
      const response = await apiClient.get(`/comment/${postId}/post`, {
        params: { sort },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching comments by post:", error);
      throw error;
    }
  },

  // Create a new comment
  async createComment(data) {
    try {
      const response = await apiClient.post("/comment", data);
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Update a comment
  async updateComment(commentId, content) {
    try {
      const response = await apiClient.patch(`/comment/${commentId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const response = await apiClient.delete(`/comment/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },
};

// Reaction Comment API
export const reactionCommentAPI = {
  // Get all reaction comments
  async getAllReactions() {
    try {
      const response = await apiClient.get("/reaction");
      return response.data;
    } catch (error) {
      console.error("Error fetching reactions:", error);
      throw error;
    }
  },

  // Get reactions by comment ID
  async getReactionsByComment(commentId) {
    try {
      const response = await apiClient.get(`/reaction/${commentId}/comment`);
      return response.data;
    } catch (error) {
      console.error("Error fetching reactions by comment:", error);
      throw error;
    }
  },

  // Add a reaction to a comment
  async addReaction(data) {
    try {
      const response = await apiClient.post("/reaction", data);
      return response.data;
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw error;
    }
  },

  // Update a reaction
  async updateReaction(reactionId, type) {
    try {
      const response = await apiClient.patch(`/reaction/${reactionId}`, {
        type,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating reaction:", error);
      throw error;
    }
  },

  // Delete a reaction
  async deleteReaction(reactionId) {
    try {
      const response = await apiClient.delete(`/reaction/${reactionId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting reaction:", error);
      throw error;
    }
  },
};
export const reportCommentAPI = {
  async createReport(data) {
    const response = await apiClient.post("/report-comment", data);
    return response.data;
  },
};

export const stepAPI = {
  async getAllStage(params = {}) {
    const response = await apiClient.get("/step", { params });
    return response.data;
  },
  async createStage(title, description) {
    const response = await apiClient.post("/step", { title, description });
    return response.data;
  },
  async updateStage(id, title, description) {
    const response = await apiClient.patch(`/step/${id}`, {
      title,
      description,
    });
    return response.data;
  },
  async deleteStage(id) {
    const response = await apiClient.delete(`/step/${id}`);
    return response.data;
  },
};

export const favoriteAPI = {
  // Get all favorite posts
  async getFavorites() {
    try {
      const response = await apiClient.get("/favorite");
      return response.data;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  // Add a post to favorites
  async addFavorite(postId) {
    try {
      const response = await apiClient.post("/favorite", { post_id: postId });
      return response.data;
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  },

  // Remove a post from favorites
  async removeFavorite(postId) {
    try {
      const response = await apiClient.delete(`/favorite/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  },
};

export const notificationAPI = {
  async getNotifications() {
    const response = await apiClient.get("/notification");
    return response.data;
  },
  async markAsRead(notificationId) {
    const response = await apiClient.patch(`/notification/${notificationId}`);
    return response.data;
  },
  async deleteNotification(notificationId) {
    const response = await apiClient.delete(`/notification/${notificationId}`);
    return response.data;
  }
};

// Service Provider Capability Profile API
export const capabilityProfileAPI = {
  // Tạo capability profile (chỉ tạo được 1 lần)
  async create(data) {
    try {
      const response = await apiClient.post("/capability-profile", data);
      return response.data;
    } catch (error) {
      console.error("Error creating capability profile:", error);
      throw error;
    }
  },

  // Xem capability profile (nếu không truyền user_id thì lấy của chính mình)
  async get(userId = null) {
    try {
      const params = userId ? { user_id: userId } : {};
      const response = await apiClient.get("/capability-profile", { params });
      return response.data;
    } catch (error) {
      // Bỏ console.error đi
      throw error;
    }
  },

  // Cập nhật capability profile
  async update(data) {
    try {
      const response = await apiClient.put("/capability-profile", data);
      return response.data;
    } catch (error) {
      console.error("Error updating capability profile:", error);
      throw error;
    }
  },
};

export default apiClient;
