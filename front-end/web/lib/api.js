import axios from "axios";

// Cấu hình base URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Function lấy token - ưu tiên auth_token, sau đó api_token
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
});

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
  }
);

// Interceptor để xử lý lỗi response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Token hết hạn hoặc không hợp lệ");
    }
    return Promise.reject(error);
  }
);

// Blog API
export const blogAPI = {
  // Lấy tất cả blog
  async getAllBlogs(params = {}) {
    try {
      const response = await apiClient.get("/blog/knowledge", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
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
        params: { search: searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching blogs:", error);
      throw error;
    }
  },
};

// Get own posts
export async function getOwnPosts(filters = {}) {
  const { status, category, search, author_id } = filters;

  // Build query string safely
  const params = new URLSearchParams();

  if (status && status !== "--") params.append("status", status);
  if (category && category !== "--") params.append("category", category);
  if (search) params.append("search", search);
  if (author_id) params.append("author_id", author_id);

  const url = `/post/general${
    params.toString() ? `?${params.toString()}` : ""
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
export async function createPost({ category, content, image, contact }) {
  const params = { category, content, image, contact };
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

export default apiClient;
