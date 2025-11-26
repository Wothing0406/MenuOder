import axios from 'axios';

// Lấy API URL từ environment variable
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

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
