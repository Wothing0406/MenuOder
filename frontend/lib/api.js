import axios from 'axios';

// Lấy API URL từ environment variable
// Default port 5002 để tránh permission issues trên Windows
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Tự động thêm /api nếu chưa có (tránh lỗi khi người dùng quên thêm /api)
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  // Nếu URL không kết thúc bằng /api, thêm vào
  API_URL = API_URL.endsWith('/') ? API_URL + 'api' : API_URL + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log API URL (chỉ trong development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_URL);
}

// Add token or admin secret to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const adminSecret = localStorage.getItem('adminSecret');
      if (adminSecret) {
        config.headers['X-Admin-Secret'] = adminSecret;
      }
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error - backend server is not running or not reachable
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        error.networkError = true;
        error.userMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend server có đang chạy không.';
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        error.networkError = true;
        error.userMessage = 'Yêu cầu quá thời gian. Vui lòng thử lại.';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
