// Utility functions

/**
 * Format số tiền thành định dạng VND
 * @param {number} amount - Số tiền cần format
 * @returns {string} - Chuỗi đã format (ví dụ: "50.000 ₫")
 */
export function formatVND(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫';
  }
  
  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Format số tiền thành định dạng VND (không có ký hiệu ₫)
 * @param {number} amount - Số tiền cần format
 * @returns {string} - Chuỗi đã format (ví dụ: "50.000")
 */
export function formatVNDNumber(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('vi-VN').format(numAmount);
}

/**
 * Convert relative image path to full URL
 * @param {string} imagePath - Relative path (e.g., '/uploads/image.jpg') or full URL
 * @returns {string} - Full URL or original path if already full URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // Nếu đã là full URL (http/https), trả về luôn
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu là relative path, chuyển thành full URL
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const cleanBase = apiBase.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  
  return cleanBase + cleanPath;
}

