import axios from 'axios';

// Cấu hình base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Function lấy token
const getToken = () => {
    if (typeof window !== 'undefined') {
        // Ưu tiên token user đăng nhập
        const authToken = localStorage.getItem('auth_token');
        if (authToken) return authToken;

        // Sau đó dùng api_token
        const apiToken = localStorage.getItem('api_token');
        if (apiToken) return apiToken;
    }
    return null;
};

// Tạo axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
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
            console.error('Token hết hạn hoặc không hợp lệ');
        }
        return Promise.reject(error);
    }
);

// Blog API
export const blogAPI = {
    // Lấy tất cả blog
    async getAllBlogs(params = {}) {
        try {
            const response = await apiClient.get('/blog/knowledge', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching blogs:', error);
            throw error;
        }
    },

    // Lấy chi tiết blog theo ID
    async getBlogById(id) {
        try {
            const response = await apiClient.get(`/blog/knowledge/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching blog detail:', error);
            throw error;
        }
    },

    // Tìm kiếm blog
    async searchBlogs(searchTerm) {
        try {
            const response = await apiClient.get('/blog/knowledge', {
                params: { search: searchTerm }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching blogs:', error);
            throw error;
        }
    }
};

// Product API
export const productAPI = {
    // Lấy tất cả sản phẩm với filter, search, sort
    async getAllProducts(params = {}) {
        try {
            const response = await apiClient.get('/products', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Lấy chi tiết sản phẩm theo ID
    async getProductById(id) {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product detail:', error);
            throw error;
        }
    },

    // Tìm kiếm sản phẩm
    async searchProducts(keyword, params = {}) {
        try {
            const response = await apiClient.get('/products/search', {
                params: { keyword, ...params }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },

    // Lọc sản phẩm
    async filterProducts(filters = {}) {
        try {
            const response = await apiClient.get('/products/filter', {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error filtering products:', error);
            throw error;
        }
    },

    // Sắp xếp sản phẩm
    async sortProducts(sortBy, sortOrder = 'desc', params = {}) {
        try {
            const response = await apiClient.get('/products/sort', {
                params: { sortBy, sortOrder, ...params }
            });
            return response.data;
        } catch (error) {
            console.error('Error sorting products:', error);
            throw error;
        }
    }
};

// Product Type API
export const productTypeAPI = {
    // Lấy tất cả loại sản phẩm
    async getAllProductTypes(params = {}) {
        try {
            const response = await apiClient.get('/type-product', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching product types:', error);
            throw error;
        }
    }
};


// Rating API
export const ratingAPI = {
    // Lấy tất cả ratings cho một sản phẩm (bao gồm statistics)
    async getRatingsByProductId(productId, params = {}) {
        try {
            const response = await apiClient.get(`/ratings/product/${productId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching ratings:', error);
            throw error;
        }
    },

    // Lấy rating của user hiện tại cho một sản phẩm
    async getMyRatingForProduct(productId) {
        try {
            const response = await apiClient.get(`/ratings/product/${productId}/my-rating`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user rating:', error);
            throw error;
        }
    },

    // Tạo rating mới
    async createRating(data) {
        try {
            const response = await apiClient.post('/ratings', data);
            return response.data;
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    },

    // Cập nhật rating
    async updateRating(ratingId, data) {
        try {
            const response = await apiClient.put(`/ratings/${ratingId}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating rating:', error);
            throw error;
        }
    },

    // Xóa rating
    async deleteRating(ratingId) {
        try {
            const response = await apiClient.delete(`/ratings/${ratingId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw error;
        }
    },

    // Lấy tất cả ratings của user hiện tại
    async getMyAllRatings(params = {}) {
        try {
            const response = await apiClient.get('/ratings/user/my-ratings', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching user ratings:', error);
            throw error;
        }
    }
};

export default apiClient;