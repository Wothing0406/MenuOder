const QRCode = require('qrcode');
const { getBankCode, getBankByCode } = require('./vietqrBanks');

/**
 * Generate VietQR format string for bank transfer
 * Format: https://vietqr.io/{bankCode}/{accountNumber}?amount={amount}&addInfo={content}
 * 
 * Or use standard format:
 * - Bank code (BIN)
 * - Account number
 * - Amount
 * - Content
 */
function generateVietQRString(bankInfo, amount, content) {
  const { bankCode, accountNumber } = bankInfo;
  
  // VietQR format (if bankCode is available)
  if (bankCode) {
    const params = new URLSearchParams();
    if (amount) params.append('amount', amount);
    if (content) params.append('addInfo', content);
    
    return `https://vietqr.io/${bankCode}/${accountNumber}${params.toString() ? '?' + params.toString() : ''}`;
  }
  
  // Fallback: Generate QR with bank transfer info as text
  // Format: "STK: {accountNumber}\nCTK: {accountName}\nNH: {bankName}\nST: {amount} VND\nND: {content}"
  const qrText = [
    `STK: ${accountNumber}`,
    `CTK: ${bankInfo.accountName}`,
    `NH: ${bankInfo.bankName}`,
    amount ? `ST: ${amount} VND` : '',
    content ? `ND: ${content}` : ''
  ].filter(Boolean).join('\n');
  
  return qrText;
}

/**
 * Get bank code alias for VietQR image URL
 * VietQR uses lowercase bank code aliases like 'mbbank', 'vietinbank', etc.
 * Uses vietqrBanks.js to get the correct alias
 */
function getBankCodeAlias(bankCode, bankName) {
  // First, try to get from vietqrBanks.js using bank code
  if (bankCode) {
    const bank = getBankByCode(bankCode);
    if (bank && bank.alias && bank.alias.length > 0) {
      // Use the first alias (usually the standard one like 'acb', 'mbbank', etc.)
      return bank.alias[0];
    }
  }
  
  // Fallback: try to get from bank name
  if (bankName) {
    const bankCodeFromName = getBankCode(bankName);
    if (bankCodeFromName) {
      const bank = getBankByCode(bankCodeFromName);
      if (bank && bank.alias && bank.alias.length > 0) {
        return bank.alias[0];
      }
    }
  }
  
  return null;
}

/**
 * Generate QR code image for bank transfer using VietQR service
 * Uses img.vietqr.io service to generate QR code image
 * Format: https://img.vietqr.io/image/{bankAlias}-{accountNumber}-{template}.jpg?amount={amount}&addInfo={content}
 */
async function generateBankTransferQR(bankInfo, order) {
  const { bankAccountNumber, bankAccountName, bankName, bankCode: providedBankCode } = bankInfo;
  
  if (!bankAccountNumber || !bankAccountName || !bankName) {
    throw new Error('Bank information is incomplete');
  }
  
  // Use provided bankCode if available, otherwise try to get from bankName
  const bankCode = providedBankCode || getBankCode(bankName);
  const amount = Math.round(parseFloat(order.totalAmount));
  const content = `Thanh toan don hang ${order.orderCode}`;
  
  console.log('Generating QR code with:', {
    bankCode,
    bankName,
    bankAccountNumber,
    amount,
    content,
    orderCode: order.orderCode
  });
  
  // Generate VietQR string for QR code data
  const qrString = generateVietQRString(
    {
      bankCode,
      accountNumber: bankAccountNumber,
      accountName: bankAccountName,
      bankName
    },
    amount,
    content
  );
  
  // Use VietQR image service: https://img.vietqr.io/image/{bankAlias}-{accountNumber}-{template}.jpg
  // Example: https://img.vietqr.io/image/mbbank-0795277227-compact.jpg?amount=100000&addInfo=Thanh%20toan%20don%20hang%20ORD-XXX
  let qrCodeImage = null;
  
  if (bankCode && bankAccountNumber) {
    // Get bank alias for URL
    const bankAlias = getBankCodeAlias(bankCode, bankName);
    
    console.log('Bank alias lookup:', { bankCode, bankName, bankAlias });
    
    if (bankAlias) {
      // Remove any spaces or special characters from account number, but keep full length
      const cleanAccountNumber = String(bankAccountNumber).replace(/\s+/g, '').trim();
      
      console.log('Account number for QR URL:', {
        original: bankAccountNumber,
        originalLength: String(bankAccountNumber).length,
        cleaned: cleanAccountNumber,
        cleanedLength: cleanAccountNumber.length
      });
      
      // Build VietQR image URL with amount and content
      // Format: https://img.vietqr.io/image/{bankAlias}-{accountNumber}-{template}.jpg?amount={amount}&addInfo={content}
      const params = new URLSearchParams();
      if (amount && amount > 0) params.append('amount', amount);
      if (content) params.append('addInfo', content);
      
      // Use compact template (smaller size) or print template (larger size)
      const template = 'compact'; // or 'print' for larger QR code
      qrCodeImage = `https://img.vietqr.io/image/${bankAlias}-${cleanAccountNumber}-${template}.jpg${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log('✅ Generated VietQR image URL:', qrCodeImage);
    } else {
      console.warn(`⚠️ Bank alias not found for code ${finalBankCode} (${bankName}), falling back to QRCode library`);
    }
  } else {
    console.warn('⚠️ Missing bankCode or bankAccountNumber:', { 
      bankCode: finalBankCode, 
      bankAccountNumber,
      bankName 
    });
  }
  
  // Fallback: Generate QR code image using QRCode library if VietQR service is not available
  if (!qrCodeImage) {
    try {
      qrCodeImage = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300
      });
      console.log('Fallback: Generated QR code using QRCode library');
    } catch (qrError) {
      console.error('Error generating QR code image:', qrError);
      throw new Error('Failed to generate QR code image');
    }
  }
  
  const result = {
    success: true,
    qrCode: qrString,
    qrCodeImage,
    bankInfo: {
      accountNumber: bankAccountNumber, // Ensure full account number is returned
      accountName: bankAccountName,
      bankName,
      bankCode
    },
    amount,
    content,
    orderCode: order.orderCode
  };

  console.log('QR result bankInfo:', {
    accountNumber: result.bankInfo.accountNumber,
    accountNumberLength: result.bankInfo.accountNumber?.length,
    accountName: result.bankInfo.accountName,
    bankName: result.bankInfo.bankName
  });

  return result;
}

module.exports = {
  generateBankTransferQR,
  generateVietQRString
};


/**
 * Generate VietQR format string for bank transfer
 * Format: https://vietqr.io/{bankCode}/{accountNumber}?amount={amount}&addInfo={content}
 * 
 * Or use standard format:
 * - Bank code (BIN)
 * - Account number
 * - Amount
 * - Content
 */
function generateVietQRString(bankInfo, amount, content) {
  const { bankCode, accountNumber } = bankInfo;
  
  // VietQR format (if bankCode is available)
  if (bankCode) {
    const params = new URLSearchParams();
    if (amount) params.append('amount', amount);
    if (content) params.append('addInfo', content);
    
    return `https://vietqr.io/${bankCode}/${accountNumber}${params.toString() ? '?' + params.toString() : ''}`;
  }
  
  // Fallback: Generate QR with bank transfer info as text
  // Format: "STK: {accountNumber}\nCTK: {accountName}\nNH: {bankName}\nST: {amount} VND\nND: {content}"
  const qrText = [
    `STK: ${accountNumber}`,
    `CTK: ${bankInfo.accountName}`,
    `NH: ${bankInfo.bankName}`,
    amount ? `ST: ${amount} VND` : '',
    content ? `ND: ${content}` : ''
  ].filter(Boolean).join('\n');
  
  return qrText;
}

/**
 * Get bank code alias for VietQR image URL
 * VietQR uses lowercase bank code aliases like 'mbbank', 'vietinbank', etc.
 * Uses vietqrBanks.js to get the correct alias
 */
function getBankCodeAlias(bankCode, bankName) {
  // First, try to get from vietqrBanks.js using bank code
  if (bankCode) {
    const bank = getBankByCode(bankCode);
    if (bank && bank.alias && bank.alias.length > 0) {
      // Use the first alias (usually the standard one like 'acb', 'mbbank', etc.)
      return bank.alias[0];
    }
  }
  
  // Fallback: try to get from bank name
  if (bankName) {
    const bankCodeFromName = getBankCode(bankName);
    if (bankCodeFromName) {
      const bank = getBankByCode(bankCodeFromName);
      if (bank && bank.alias && bank.alias.length > 0) {
        return bank.alias[0];
      }
    }
  }
  
  return null;
}

/**
 * Generate QR code image for bank transfer using VietQR service
 * Uses img.vietqr.io service to generate QR code image
 * Format: https://img.vietqr.io/image/{bankAlias}-{accountNumber}-{template}.jpg?amount={amount}&addInfo={content}
 */
async function generateBankTransferQR(bankInfo, order) {
  const { bankAccountNumber, bankAccountName, bankName, bankCode: providedBankCode } = bankInfo;
  
  if (!bankAccountNumber || !bankAccountName || !bankName) {
    throw new Error('Bank information is incomplete');
  }
  
  // Use provided bankCode if available, otherwise try to get from bankName
  const bankCode = providedBankCode || getBankCode(bankName);
  const amount = Math.round(parseFloat(order.totalAmount));
  const content = `Thanh toan don hang ${order.orderCode}`;
  
  console.log('Generating QR code with:', {
    bankCode,
    bankName,
    bankAccountNumber,
    amount,
    content,
    orderCode: order.orderCode
  });
  
  // Generate VietQR string for QR code data
  const qrString = generateVietQRString(
    {
      bankCode,
      accountNumber: bankAccountNumber,
      accountName: bankAccountName,
      bankName
    },
    amount,
    content
  );
  
  // Use VietQR image service: https://img.vietqr.io/image/{bankAlias}-{accountNumber}-{template}.jpg
  // Example: https://img.vietqr.io/image/mbbank-0795277227-compact.jpg?amount=100000&addInfo=Thanh%20toan%20don%20hang%20ORD-XXX
  let qrCodeImage = null;
  
  if (bankCode && bankAccountNumber) {
    // Get bank alias for URL
    const bankAlias = getBankCodeAlias(bankCode, bankName);
    
    console.log('Bank alias lookup:', { bankCode, bankName, bankAlias });
    
    if (bankAlias) {
      // Remove any spaces or special characters from account number, but keep full length
      const cleanAccountNumber = String(bankAccountNumber).replace(/\s+/g, '').trim();
      
      console.log('Account number for QR URL:', {
        original: bankAccountNumber,
        originalLength: String(bankAccountNumber).length,
        cleaned: cleanAccountNumber,
        cleanedLength: cleanAccountNumber.length
      });
      
      // Build VietQR image URL with amount and content
      // Format: https://img.vietqr.io/image/{bankAlias}-{accountNumber}-{template}.jpg?amount={amount}&addInfo={content}
      const params = new URLSearchParams();
      if (amount && amount > 0) params.append('amount', amount);
      if (content) params.append('addInfo', content);
      
      // Use compact template (smaller size) or print template (larger size)
      const template = 'compact'; // or 'print' for larger QR code
      qrCodeImage = `https://img.vietqr.io/image/${bankAlias}-${cleanAccountNumber}-${template}.jpg${params.toString() ? '?' + params.toString() : ''}`;
      
      console.log('✅ Generated VietQR image URL:', qrCodeImage);
    } else {
      console.warn(`⚠️ Bank alias not found for code ${finalBankCode} (${bankName}), falling back to QRCode library`);
    }
  } else {
    console.warn('⚠️ Missing bankCode or bankAccountNumber:', { 
      bankCode: finalBankCode, 
      bankAccountNumber,
      bankName 
    });
  }
  
  // Fallback: Generate QR code image using QRCode library if VietQR service is not available
  if (!qrCodeImage) {
    try {
      qrCodeImage = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300
      });
      console.log('Fallback: Generated QR code using QRCode library');
    } catch (qrError) {
      console.error('Error generating QR code image:', qrError);
      throw new Error('Failed to generate QR code image');
    }
  }
  
  const result = {
    success: true,
    qrCode: qrString,
    qrCodeImage,
    bankInfo: {
      accountNumber: bankAccountNumber, // Ensure full account number is returned
      accountName: bankAccountName,
      bankName,
      bankCode
    },
    amount,
    content,
    orderCode: order.orderCode
  };

  console.log('QR result bankInfo:', {
    accountNumber: result.bankInfo.accountNumber,
    accountNumberLength: result.bankInfo.accountNumber?.length,
    accountName: result.bankInfo.accountName,
    bankName: result.bankInfo.bankName
  });

  return result;
}

module.exports = {
  generateBankTransferQR,
  generateVietQRString
};
