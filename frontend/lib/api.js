import axios from 'axios';

// Lấy API URL từ environment variable
// Default port 5002 để tránh permission issues trên Windows
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Tự động thêm /api nếu chưa có (tránh lỗi khi người dùng quên thêm /api)
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  // Nếu URL không kết thúc bằng /api, thêm vào
  API_URL = API_URL.endsWith('/') ? API_URL + 'api' : API_URL + '/api';
}

// Warning nếu đang dùng localhost trong production
if (typeof window !== 'undefined' && API_URL.includes('localhost') && window.location.hostname !== 'localhost') {
  console.error('⚠️ WARNING: API URL đang trỏ đến localhost trong production!');
  console.error('Vui lòng set NEXT_PUBLIC_API_URL trong Vercel Environment Variables');
  console.error('Current API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log API URL (cả development và production để debug)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_URL);
  // Store API URL globally for debugging
  window.__API_URL__ = API_URL;
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
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear authentication if token is invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }

    // Handle network errors
    if (!error.response) {
      // Network error - backend server is not running or not reachable
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        error.networkError = true;
        const apiUrl = typeof window !== 'undefined' ? window.__API_URL__ || API_URL : API_URL;
        console.error('❌ Network Error - Cannot connect to API:', apiUrl);
        console.error('Error details:', error.message, error.code);
        error.userMessage = `Không thể kết nối đến server (${apiUrl}). Vui lòng kiểm tra cấu hình NEXT_PUBLIC_API_URL trên Vercel.`;
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        error.networkError = true;
        const apiUrl = typeof window !== 'undefined' ? window.__API_URL__ || API_URL : API_URL;
        console.error('⏱️ Timeout Error - API:', apiUrl);
        error.userMessage = 'Yêu cầu quá thời gian. Vui lòng thử lại.';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
