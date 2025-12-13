const axios = require('axios');
const { getBankCode } = require('./vietqrBanks');

/**
 * Normalize Vietnamese text for comparison
 * Removes diacritics and converts to lowercase
 */
function normalizeVietnamese(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const normalized1 = normalizeVietnamese(str1);
  const normalized2 = normalizeVietnamese(str2);
  
  if (normalized1 === normalized2) return 1;
  
  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.9;
  }
  
  // Simple word-based similarity
  const words1 = normalized1.split(/\s+/).filter(w => w.length > 2);
  const words2 = normalized2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
}

/**
 * Validate bank account number format
 */
function validateAccountNumberFormat(accountNumber) {
  if (!accountNumber) return { valid: false, error: 'Số tài khoản không được để trống' };
  
  const cleaned = accountNumber.trim().replace(/\s+/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Số tài khoản chỉ được chứa chữ số' };
  }
  
  // Check length (typically 8-19 digits for Vietnamese banks)
  if (cleaned.length < 8 || cleaned.length > 19) {
    return { valid: false, error: 'Số tài khoản phải có từ 8 đến 19 chữ số' };
  }
  
  return { valid: true, cleaned };
}

/**
 * Verify bank account using VietQR API
 * @param {string} accountNumber - Bank account number
 * @param {string} bankCode - Bank code (BIN)
 * @param {string} accountName - Account holder name to verify
 * @returns {Promise<{success: boolean, verified: boolean, accountName?: string, similarity?: number, error?: string}>}
 */
async function verifyBankAccount(accountNumber, bankCode, accountName) {
  try {
    // First validate format
    const formatCheck = validateAccountNumberFormat(accountNumber);
    if (!formatCheck.valid) {
      return {
        success: false,
        verified: false,
        error: formatCheck.error
      };
    }
    
    const cleanedAccountNumber = formatCheck.cleaned;
    
    // Check if bank code is valid
    if (!bankCode || bankCode.length < 6) {
      return {
        success: false,
        verified: false,
        error: 'Mã ngân hàng không hợp lệ'
      };
    }
    
    // Check if VietQR API key is configured
    const apiKey = process.env.VIETQR_API_KEY;
    const apiId = process.env.VIETQR_API_ID;
    
    if (!apiKey || !apiId) {
      // If no API key, return basic validation only
      // In production, you might want to require API key for verification
      return {
        success: true,
        verified: false,
        warning: 'Chưa cấu hình API key VietQR. Không thể xác thực tài khoản tự động. Vui lòng kiểm tra thông tin tài khoản cẩn thận.',
        requiresManualVerification: true
      };
    }
    
    // Call VietQR API to lookup account name
    // Note: VietQR API v2 uses POST method, not GET
    try {
      const response = await axios.post('https://api.vietqr.io/v2/lookup', {
        bin: bankCode,
        accountNumber: cleanedAccountNumber
      }, {
        headers: {
          'x-client-id': apiId,
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      // Check response format - VietQR API can return different formats
      const responseData = response.data;
      
      // Check for Free Plan expiration message
      const responseMessage = responseData.message || responseData.desc || '';
      const isFreePlanExpired = responseMessage.toLowerCase().includes('free plan') || 
                                responseMessage.toLowerCase().includes('no longer support');
      
      if (isFreePlanExpired) {
        // Free Plan has expired - allow account creation but mark as unverified
        return {
          success: true,
          verified: false,
          error: 'Gói Free Plan của VietQR đã hết hạn. Bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực. Để xác thực tự động, vui lòng nâng cấp gói VietQR hoặc nhập thông tin tài khoản thủ công.',
          warning: 'Tài khoản chưa được xác thực tự động do Free Plan đã hết hạn.'
        };
      }
      
      // Check if API returned an error code
      if (responseData.code && responseData.code !== '00') {
        // API returned an error code (e.g., account not found)
        return {
          success: true,
          verified: false,
          error: responseData.desc || responseData.message || 'Không tìm thấy tài khoản với số tài khoản và mã ngân hàng này. Vui lòng kiểm tra lại số tài khoản và mã ngân hàng. Nếu thông tin đúng, bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực.',
          warning: 'Tài khoản chưa được xác thực tự động. Vui lòng kiểm tra lại thông tin.'
        };
      }
      
      if (responseData && responseData.data) {
        const lookupAccountName = responseData.data.accountName;
        
        if (!lookupAccountName) {
          return {
            success: true,
            verified: false,
            error: 'Không tìm thấy thông tin tài khoản. Vui lòng kiểm tra lại số tài khoản và mã ngân hàng. Nếu thông tin đúng, bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực.',
            warning: 'Tài khoản chưa được xác thực tự động. Vui lòng kiểm tra lại thông tin.'
          };
        }
        
        // If no account name provided, just return the lookup result
        if (!accountName || accountName.trim() === '') {
          return {
            success: true,
            verified: true,
            accountName: lookupAccountName,
            message: 'Tìm thấy thông tin tài khoản'
          };
        }
        
        // Compare account names
        const similarity = calculateSimilarity(accountName, lookupAccountName);
        const threshold = 0.7; // 70% similarity required
        
        if (similarity >= threshold) {
          return {
            success: true,
            verified: true,
            accountName: lookupAccountName,
            similarity: similarity,
            message: 'Tài khoản đã được xác thực thành công'
          };
        } else {
          return {
            success: true,
            verified: false,
            lookupAccountName: lookupAccountName,
            providedAccountName: accountName,
            similarity: similarity,
            error: `Tên chủ tài khoản không khớp. Tên từ ngân hàng: "${lookupAccountName}", Tên bạn nhập: "${accountName}". Vui lòng kiểm tra lại.`
          };
        }
      } else {
        // No data in response - account not found
        return {
          success: true,
          verified: false,
          error: 'Không tìm thấy thông tin tài khoản từ ngân hàng. Vui lòng kiểm tra lại số tài khoản và mã ngân hàng. Nếu thông tin đúng, bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực.',
          warning: 'Tài khoản chưa được xác thực tự động. Vui lòng kiểm tra lại thông tin.'
        };
      }
    } catch (apiError) {
      console.error('VietQR API error:', apiError.response?.data || apiError.message);
      
      // Check for Free Plan expiration in error response
      const errorData = apiError.response?.data;
      const errorMessage = errorData?.message || errorData?.desc || errorData?.error || '';
      const isFreePlanExpired = errorMessage.toLowerCase().includes('free plan') || 
                                errorMessage.toLowerCase().includes('no longer support');
      
      if (isFreePlanExpired) {
        return {
          success: true,
          verified: false,
          error: 'Gói Free Plan của VietQR đã hết hạn. Bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực. Để xác thực tự động, vui lòng nâng cấp gói VietQR hoặc nhập thông tin tài khoản thủ công.',
          warning: 'Tài khoản chưa được xác thực tự động do Free Plan đã hết hạn.'
        };
      }
      
      // Handle specific API errors
      if (apiError.response?.status === 404) {
        // 404 means account not found - but we should still allow creation if not in strict mode
        // Return success: true but verified: false so controller can decide
        return {
          success: true,
          verified: false,
          error: 'Không tìm thấy tài khoản với số tài khoản và mã ngân hàng này. Vui lòng kiểm tra lại số tài khoản và mã ngân hàng. Nếu thông tin đúng, bạn vẫn có thể tạo tài khoản nhưng sẽ được đánh dấu là chưa xác thực.',
          warning: 'Tài khoản chưa được xác thực tự động. Vui lòng kiểm tra lại thông tin.'
        };
      } else if (apiError.response?.status === 401 || apiError.response?.status === 403) {
        return {
          success: false,
          verified: false,
          error: 'Lỗi xác thực API VietQR. Vui lòng liên hệ quản trị viên.'
        };
      } else if (apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT') {
        return {
          success: false,
          verified: false,
          error: 'Kết nối đến dịch vụ xác thực quá thời gian. Vui lòng thử lại sau.'
        };
      } else {
        return {
          success: false,
          verified: false,
          error: 'Lỗi khi xác thực tài khoản. Vui lòng thử lại sau.'
        };
      }
    }
  } catch (error) {
    console.error('Bank account verification error:', error);
    return {
      success: false,
      verified: false,
      error: error.message || 'Lỗi không xác định khi xác thực tài khoản'
    };
  }
}

/**
 * Basic validation without API call (for when API is not available)
 */
function basicBankAccountValidation(accountNumber, bankCode, accountName) {
  const formatCheck = validateAccountNumberFormat(accountNumber);
  if (!formatCheck.valid) {
    return {
      success: false,
      verified: false,
      error: formatCheck.error
    };
  }
  
  if (!bankCode || bankCode.length < 6) {
    return {
      success: false,
      verified: false,
      error: 'Mã ngân hàng không hợp lệ'
    };
  }
  
  if (!accountName || accountName.trim().length < 3) {
    return {
      success: false,
      verified: false,
      error: 'Tên chủ tài khoản phải có ít nhất 3 ký tự'
    };
  }
  
  // Basic validation passed, but not verified via API
  return {
    success: true,
    verified: false,
    requiresManualVerification: true,
    warning: 'Chưa thể xác thực tự động. Vui lòng đảm bảo thông tin tài khoản chính xác.'
  };
}

module.exports = {
  verifyBankAccount,
  basicBankAccountValidation,
  validateAccountNumberFormat,
  calculateSimilarity,
  normalizeVietnamese
};

