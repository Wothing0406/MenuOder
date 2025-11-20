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

