const { PaymentAccount, Store } = require('../models');
const { verifyCredentials: verifyZaloPayCredentials } = require('../utils/zaloPay');
const { getBankCode } = require('../utils/vietqrBanks');
const { verifyBankAccount, basicBankAccountValidation } = require('../utils/bankAccountVerification');

/**
 * Get all payment accounts for a store
 */
exports.getPaymentAccounts = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const accounts = await PaymentAccount.findAll({
      where: { storeId },
      order: [['accountType', 'ASC'], ['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    console.log(`📋 [DASHBOARD] Found ${accounts.length} payment accounts for store ${storeId}`);
    accounts.forEach(acc => {
      if (acc.accountType === 'bank_transfer') {
        console.log(`  💳 Account ${acc.id}:`, {
          accountName: acc.accountName,
          bankName: acc.bankName,
          bankAccountNumber: acc.bankAccountNumber,
          bankAccountNumberLength: acc.bankAccountNumber?.length,
          isActive: acc.isActive,
          isVerified: acc.isVerified,
          isDefault: acc.isDefault,
          isDefaultString: acc.isDefault ? '✅ DEFAULT' : '❌ NOT DEFAULT'
        });
      }
    });
    
    // Check default accounts
    const defaultBankAccount = accounts.find(acc => 
      acc.accountType === 'bank_transfer' && acc.isDefault
    );
    if (defaultBankAccount) {
      console.log(`✅ [DASHBOARD] Default bank account: ${defaultBankAccount.accountName} (${defaultBankAccount.bankName})`);
    } else {
      console.warn(`⚠️ [DASHBOARD] No default bank account set for store ${storeId}`);
    }

    const mappedAccounts = accounts.map(account => {
      const accountData = {
        id: account.id,
        accountType: account.accountType,
        accountName: account.accountName,
        isActive: account.isActive,
        isDefault: account.isDefault,
        isVerified: account.isVerified,
        verifiedAt: account.verifiedAt,
        verificationError: account.verificationError,
        // Only return safe fields for display - ensure full account number
        ...(account.accountType === 'bank_transfer' ? {
          bankAccountNumber: account.bankAccountNumber ? String(account.bankAccountNumber) : null, // Convert to string to ensure full number
          bankAccountName: account.bankAccountName,
          bankName: account.bankName,
          bankCode: account.bankCode
        } : {}),
        ...(account.accountType === 'zalopay' ? {
          zaloPayAppId: account.zaloPayAppId,
          zaloPayMerchantId: account.zaloPayMerchantId,
          hasKey1: !!account.zaloPayKey1,
          hasKey2: !!account.zaloPayKey2
        } : {}),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };
      
      // Log account number to verify it's complete
      if (account.accountType === 'bank_transfer' && accountData.bankAccountNumber) {
        console.log(`  Returning account ${accountData.id} with STK: ${accountData.bankAccountNumber} (length: ${accountData.bankAccountNumber.length})`);
      }
      
      return accountData;
    });

    console.log(`Returning ${mappedAccounts.length} accounts to frontend`);

    res.json({
      success: true,
      data: mappedAccounts
    });
  } catch (error) {
    console.error('Get payment accounts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment accounts'
    });
  }
};

/**
 * Create new payment account with verification
 */
exports.createPaymentAccount = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      accountType,
      accountName,
      isDefault = false,
      // Bank transfer fields
      bankAccountNumber,
      bankAccountName,
      bankName,
      bankCode,
      // ZaloPay fields
      zaloPayAppId,
      zaloPayKey1,
      zaloPayKey2,
      zaloPayMerchantId
    } = req.body;

    // Validate required fields
    if (!accountType || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Loại tài khoản và tên hiển thị là bắt buộc'
      });
    }

    if (!['bank_transfer', 'zalopay'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: 'Loại tài khoản không hợp lệ'
      });
    }

    // Validate specific fields based on account type
    if (accountType === 'bank_transfer') {
      if (!bankAccountNumber || !bankAccountName || !bankName) {
        return res.status(400).json({
          success: false,
          message: 'Số tài khoản, tên chủ tài khoản và tên ngân hàng là bắt buộc'
        });
      }
      
      // Check if account already exists
      const existingBankAccount = await PaymentAccount.findOne({
        where: {
          storeId,
          accountType: 'bank_transfer',
          bankAccountNumber: bankAccountNumber.trim(),
          bankName: bankName.trim()
        }
      });
      
      if (existingBankAccount) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản ngân hàng này đã được liên kết. Vui lòng kiểm tra lại hoặc sử dụng tài khoản khác.'
        });
      }
      
      // Auto-generate bank code if not provided
      let finalBankCode = bankCode;
      if (!finalBankCode && bankName) {
        finalBankCode = getBankCode(bankName);
        console.log(`🔍 Auto-generated bank code for ${bankName}: ${finalBankCode}`);
      }
      
      // Verify bank account exists - ALWAYS initialize accountVerification
      let accountVerification = {
        success: false,
        verified: false,
        error: null,
        warning: null
      };
      
      try {
        if (finalBankCode) {
          try {
            console.log(`🔍 Verifying bank account: ${bankAccountNumber} (${bankName})`);
            accountVerification = await verifyBankAccount(
              bankAccountNumber.trim(),
              finalBankCode,
              bankAccountName.trim()
            );
            console.log(`✅ Verification result:`, {
              success: accountVerification.success,
              verified: accountVerification.verified,
              error: accountVerification.error,
              warning: accountVerification.warning
            });
          } catch (error) {
            console.error('❌ Bank account verification error:', error);
            // Fall back to basic validation
            accountVerification = basicBankAccountValidation(
              bankAccountNumber.trim(),
              finalBankCode,
              bankAccountName.trim()
            );
            console.log(`⚠️  Using basic validation result:`, accountVerification);
          }
        } else {
          // If no bank code, do basic validation only
          console.log(`⚠️  No bank code found, using basic validation only`);
          accountVerification = basicBankAccountValidation(
            bankAccountNumber.trim(),
            '',
            bankAccountName.trim()
          );
        }
      } catch (error) {
        console.error('❌ Error during verification process:', error);
        // If verification completely fails, use basic validation as fallback
        accountVerification = basicBankAccountValidation(
          bankAccountNumber.trim(),
          finalBankCode || '',
          bankAccountName.trim()
        );
      }
      
      // Ensure accountVerification is always defined
      if (!accountVerification) {
        console.warn('⚠️  accountVerification is undefined, using default');
        accountVerification = {
          success: true,
          verified: false,
          warning: 'Không thể xác thực tự động. Tài khoản sẽ được tạo nhưng chưa được xác thực.'
        };
      }
      
      // If verification failed completely (format validation failed, etc.), reject the account
      // Only reject if it's a format/validation error, not API errors
      if (!accountVerification.success) {
        // Check if it's a format validation error (should reject) vs API error (should allow)
        const isFormatError = accountVerification.error && (
          accountVerification.error.includes('Số tài khoản') ||
          accountVerification.error.includes('Mã ngân hàng') ||
          accountVerification.error.includes('Tên chủ tài khoản')
        );
        
        if (isFormatError) {
          console.error(`❌ Rejecting account due to format validation error:`, accountVerification.error);
          return res.status(400).json({
            success: false,
            message: accountVerification.error || 'Thông tin tài khoản không hợp lệ'
          });
        }
        
        // For API errors, allow creation but mark as unverified
        console.warn(`⚠️  API verification failed, but allowing account creation (unverified):`, {
          accountNumber: bankAccountNumber,
          bankName: bankName,
          reason: accountVerification.error
        });
        // Continue to create account with isVerified = false
      }
      
      // If account is not verified (not found, name mismatch, or API unavailable), warn but allow if manual verification is acceptable
      if (accountVerification.success && !accountVerification.verified) {
        // In strict mode, reject unverified accounts
        // You can set STRICT_BANK_VERIFICATION=true in environment to enable this
        if (process.env.STRICT_BANK_VERIFICATION === 'true') {
          return res.status(400).json({
            success: false,
            message: accountVerification.error || accountVerification.warning || 'Tài khoản chưa được xác thực. Vui lòng kiểm tra lại thông tin.'
          });
        }
        
        // Otherwise, allow but mark as unverified
        // The account will be created with isVerified = false
        // Log warning for admin review
        console.warn(`⚠️  Creating unverified bank account for store ${storeId}:`, {
          accountNumber: bankAccountNumber,
          bankName: bankName,
          reason: accountVerification.error || accountVerification.warning
        });
      }
    } else if (accountType === 'zalopay') {
      if (!zaloPayAppId || !zaloPayKey1) {
        return res.status(400).json({
          success: false,
          message: 'ZaloPay App ID và Key 1 là bắt buộc'
        });
      }
      
      // Check if ZaloPay account already exists
      const existingZaloPayAccount = await PaymentAccount.findOne({
        where: {
          storeId,
          accountType: 'zalopay',
          zaloPayAppId: zaloPayAppId.trim()
        }
      });
      
      if (existingZaloPayAccount) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản ZaloPay với App ID này đã được liên kết. Vui lòng kiểm tra lại hoặc sử dụng tài khoản khác.'
        });
      }
    }

    let isVerified = false;
    let verificationError = null;
    let verifiedAt = null;

    // Verify account before creating
    try {
      if (accountType === 'bank_transfer') {
        // Use the verification result from earlier - ensure accountVerification is defined
        if (accountVerification && accountVerification.verified) {
          isVerified = true;
          verifiedAt = new Date();
          console.log(`✅ Bank account verified successfully`);
        } else {
          isVerified = false;
          verificationError = accountVerification?.error || accountVerification?.warning || 'Tài khoản chưa được xác thực';
          console.log(`⚠️  Bank account not verified:`, verificationError);
        }
      } else if (accountType === 'zalopay') {
        // Verify ZaloPay credentials
        const verifyResult = await verifyZaloPayCredentials({
          zaloPayAppId,
          zaloPayKey1,
          zaloPayKey2,
          zaloPayMerchantId
        });
        
        if (verifyResult.success) {
          isVerified = true;
          verifiedAt = new Date();
        } else {
          verificationError = verifyResult.return_message || 'Xác thực ZaloPay thất bại';
        }
      }
    } catch (error) {
      console.error('Account verification error:', error);
      verificationError = error.message || 'Lỗi khi xác thực tài khoản';
    }

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await PaymentAccount.update(
        { isDefault: false },
        { where: { storeId, accountType } }
      );
    }

    // Auto-generate bank code if not provided (already done above for bank_transfer)
    let finalBankCode = bankCode;
    if (accountType === 'bank_transfer' && !finalBankCode && bankName) {
      finalBankCode = getBankCode(bankName);
    }

    // Log before creating to ensure full account number
    if (accountType === 'bank_transfer') {
      console.log('Creating bank account with:', {
        bankAccountNumber,
        bankAccountNumberLength: bankAccountNumber?.length,
        bankAccountName,
        bankName,
        bankCode: finalBankCode
      });
    }

    console.log(`💾 Creating payment account for store ${storeId}:`, {
      accountType,
      accountName,
      isDefault,
      isVerified,
      isActive: true, // Always active by default
      ...(accountType === 'bank_transfer' ? {
        bankAccountNumber: bankAccountNumber ? String(bankAccountNumber).trim() : null,
        bankAccountNumberLength: bankAccountNumber ? String(bankAccountNumber).trim().length : 0,
        bankAccountName,
        bankName,
        bankCode: finalBankCode
      } : {})
    });

    // Use transaction to ensure data consistency
    const transaction = await PaymentAccount.sequelize.transaction();
    
    try {
      const newAccount = await PaymentAccount.create({
      storeId,
      accountType,
      accountName,
      isDefault,
      isVerified,
      verifiedAt,
      verificationError,
      // Bank transfer fields - ensure full account number is saved (no truncation)
      ...(accountType === 'bank_transfer' ? {
        bankAccountNumber: bankAccountNumber ? String(bankAccountNumber).trim() : null, // Convert to string and trim, but keep full length
        bankAccountName,
        bankName,
        bankCode: finalBankCode
      } : {}),
      // ZaloPay fields
      ...(accountType === 'zalopay' ? {
        zaloPayAppId,
        zaloPayKey1,
        zaloPayKey2,
        zaloPayMerchantId
      } : {}),
      isActive: true // Always set isActive to true by default
    }, { transaction });

      // Commit transaction
      await transaction.commit();
      
      console.log(`✅ Payment account created successfully (transaction committed):`, {
        id: newAccount.id,
        accountName: newAccount.accountName,
        accountType: newAccount.accountType,
        storeId: newAccount.storeId,
        isDefault: newAccount.isDefault,
        isVerified: newAccount.isVerified,
        isActive: newAccount.isActive,
        ...(newAccount.accountType === 'bank_transfer' ? {
          bankAccountNumber: newAccount.bankAccountNumber,
          bankAccountNumberLength: newAccount.bankAccountNumber?.length
        } : {})
      });

      // Verify account was actually saved to database
      const verifyAccount = await PaymentAccount.findByPk(newAccount.id);
      if (!verifyAccount) {
        console.error('❌ CRITICAL: Account was created but not found in database!');
        return res.status(500).json({
          success: false,
          message: 'Tài khoản đã được tạo nhưng không thể xác nhận trong database'
        });
      }
      console.log(`✅ Verified: Account ${newAccount.id} exists in database with STK: ${verifyAccount.bankAccountNumber || 'N/A'}`);

      // Return full account data to frontend
      const accountData = {
        id: newAccount.id,
        accountType: newAccount.accountType,
        accountName: newAccount.accountName,
        isActive: newAccount.isActive,
        isDefault: newAccount.isDefault,
        isVerified: newAccount.isVerified,
        verifiedAt: newAccount.verifiedAt,
        verificationError: newAccount.verificationError,
        ...(newAccount.accountType === 'bank_transfer' ? {
          bankAccountNumber: newAccount.bankAccountNumber ? String(newAccount.bankAccountNumber) : null,
          bankAccountName: newAccount.bankAccountName,
          bankName: newAccount.bankName,
          bankCode: newAccount.bankCode
        } : {}),
        createdAt: newAccount.createdAt,
        updatedAt: newAccount.updatedAt
      };

      res.json({
        success: true,
        message: isVerified 
          ? 'Tài khoản thanh toán đã được tạo và xác thực thành công'
          : 'Tài khoản thanh toán đã được tạo nhưng chưa xác thực được',
        data: accountData
      });
    } catch (createError) {
      // Rollback transaction on error
      await transaction.rollback();
      console.error('❌ Error creating payment account (transaction rolled back):', createError);
      throw createError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('❌ Create payment account error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.parent ? {
        parentMessage: error.parent.message,
        parentCode: error.parent.code,
        parentErrno: error.parent.errno
      } : {})
    });
    
    // Check if it's a database constraint error
    if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeDatabaseError') {
      console.error('❌ Database constraint error - account may not have been saved');
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update payment account
 */
exports.updatePaymentAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const updateData = req.body;

    const account = await PaymentAccount.findByPk(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản thanh toán'
      });
    }

    // If setting as default, unset other defaults of same type (but not this account)
    if (updateData.isDefault) {
      const { Op } = require('sequelize');
      console.log(`🔄 Setting account ${accountId} as default. Unsetting other ${account.accountType} defaults for store ${account.storeId}...`);
      const unsetResult = await PaymentAccount.update(
        { isDefault: false },
        { 
          where: { 
            storeId: account.storeId, 
            accountType: account.accountType,
            id: { [Op.ne]: accountId } // Don't unset the account being updated
          } 
        }
      );
      console.log(`✅ Unset ${unsetResult[0]} other ${account.accountType} accounts from default`);
    }

    // Re-verify bank account if bank details changed
    if (account.accountType === 'bank_transfer' && 
        (updateData.bankAccountNumber || updateData.bankAccountName || updateData.bankName || updateData.bankCode)) {
      try {
        // Ensure full account number is preserved
        if (updateData.bankAccountNumber) {
          updateData.bankAccountNumber = String(updateData.bankAccountNumber).trim();
          console.log('Updating bank account number:', {
            accountId,
            bankAccountNumber: updateData.bankAccountNumber,
            bankAccountNumberLength: updateData.bankAccountNumber.length
          });
        }
        
        const accountNumber = updateData.bankAccountNumber || account.bankAccountNumber;
        const accountName = updateData.bankAccountName || account.bankAccountName;
        const bankName = updateData.bankName || account.bankName;
        let bankCodeToUse = updateData.bankCode || account.bankCode;
        
        if (!bankCodeToUse && bankName) {
          bankCodeToUse = getBankCode(bankName);
        }
        
        if (accountNumber && accountName && bankCodeToUse) {
          const verification = await verifyBankAccount(
            String(accountNumber).trim(),
            bankCodeToUse,
            String(accountName).trim()
          );
          
          if (verification.verified) {
            updateData.isVerified = true;
            updateData.verifiedAt = new Date();
            updateData.verificationError = null;
          } else {
            updateData.isVerified = false;
            updateData.verificationError = verification.error || verification.warning || 'Tài khoản chưa được xác thực';
          }
        }
      } catch (error) {
        console.error('Bank account re-verification error:', error);
        updateData.isVerified = false;
        updateData.verificationError = 'Lỗi khi xác thực lại tài khoản';
      }
    }
    
    // Re-verify if credentials changed
    if (account.accountType === 'zalopay' && 
        (updateData.zaloPayAppId || updateData.zaloPayKey1 || updateData.zaloPayKey2)) {
      try {
        const verifyResult = await verifyZaloPayCredentials({
          zaloPayAppId: updateData.zaloPayAppId || account.zaloPayAppId,
          zaloPayKey1: updateData.zaloPayKey1 || account.zaloPayKey1,
          zaloPayKey2: updateData.zaloPayKey2 || account.zaloPayKey2,
          zaloPayMerchantId: updateData.zaloPayMerchantId || account.zaloPayMerchantId
        });
        
        if (verifyResult.success) {
          updateData.isVerified = true;
          updateData.verifiedAt = new Date();
          updateData.verificationError = null;
        } else {
          updateData.isVerified = false;
          updateData.verificationError = verifyResult.return_message || 'Xác thực ZaloPay thất bại';
        }
      } catch (error) {
        updateData.isVerified = false;
        updateData.verificationError = error.message || 'Lỗi khi xác thực tài khoản';
      }
    }

    await account.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật tài khoản thanh toán thành công',
      data: { id: account.id }
    });
  } catch (error) {
    console.error('Update payment account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment account'
    });
  }
};

/**
 * Delete payment account
 */
exports.deletePaymentAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await PaymentAccount.findByPk(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản thanh toán'
      });
    }

    await account.destroy();

    res.json({
      success: true,
      message: 'Xóa tài khoản thanh toán thành công'
    });
  } catch (error) {
    console.error('Delete payment account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete payment account'
    });
  }
};

/**
 * Verify payment account credentials
 */
exports.verifyPaymentAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await PaymentAccount.findByPk(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản thanh toán'
      });
    }

    let isVerified = false;
    let verificationError = null;

    try {
      if (account.accountType === 'bank_transfer') {
        // Verify bank account using API
        if (!account.bankAccountNumber || !account.bankAccountName || !account.bankName) {
          verificationError = 'Thông tin tài khoản ngân hàng không đầy đủ';
        } else {
          let bankCodeToUse = account.bankCode;
          if (!bankCodeToUse && account.bankName) {
            bankCodeToUse = getBankCode(account.bankName);
          }
          
          if (bankCodeToUse) {
            const verification = await verifyBankAccount(
              account.bankAccountNumber.trim(),
              bankCodeToUse,
              account.bankAccountName.trim()
            );
            
            if (verification.verified) {
              isVerified = true;
            } else {
              verificationError = verification.error || verification.warning || 'Không thể xác thực tài khoản';
            }
          } else {
            // Basic validation if no bank code
            const basicCheck = basicBankAccountValidation(
              account.bankAccountNumber.trim(),
              '',
              account.bankAccountName.trim()
            );
            if (basicCheck.success && !basicCheck.requiresManualVerification) {
              isVerified = true;
            } else {
              verificationError = 'Mã ngân hàng không hợp lệ. Không thể xác thực tài khoản.';
            }
          }
        }
      } else if (account.accountType === 'zalopay') {
        const verifyResult = await verifyZaloPayCredentials({
          zaloPayAppId: account.zaloPayAppId,
          zaloPayKey1: account.zaloPayKey1,
          zaloPayKey2: account.zaloPayKey2,
          zaloPayMerchantId: account.zaloPayMerchantId
        });
        
        if (verifyResult.success) {
          isVerified = true;
        } else {
          verificationError = verifyResult.return_message || 'Xác thực ZaloPay thất bại';
        }
      }
    } catch (error) {
      verificationError = error.message || 'Lỗi khi xác thực tài khoản';
    }

    // Update verification status
    await account.update({
      isVerified,
      verifiedAt: isVerified ? new Date() : null,
      verificationError
    });

    res.json({
      success: isVerified,
      message: isVerified ? 'Xác thực tài khoản thành công' : 'Xác thực tài khoản thất bại',
      data: {
        isVerified,
        verificationError
      }
    });
  } catch (error) {
    console.error('Verify payment account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment account'
    });
  }
};

/**
 * Get active payment accounts for checkout (public endpoint)
 */
exports.getActivePaymentAccounts = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Get active accounts for checkout (allow unverified if store owner has set them as active)
    // Only the default account (set by store owner) will be used for QR generation
    // For bank_transfer: Return active accounts (verified preferred, but allow unverified if store owner enabled them)
    const accounts = await PaymentAccount.findAll({
      where: { 
        storeId, 
        isActive: true
        // Return active accounts - store owner controls visibility via isActive
        // Verification is preferred but not strictly required if store owner has enabled the account
      },
      order: [['accountType', 'ASC'], ['isVerified', 'DESC'], ['isDefault', 'DESC'], ['accountName', 'ASC']]
    });
    
    console.log(`🔍 Found ${accounts.length} active and verified payment accounts for store ${storeId}`);
    accounts.forEach(acc => {
      if (acc.accountType === 'bank_transfer') {
        console.log(`  💳 Bank Account ${acc.id}:`, {
          accountName: acc.accountName,
          bankName: acc.bankName,
          bankAccountNumber: acc.bankAccountNumber,
          bankAccountNumberLength: acc.bankAccountNumber?.length,
          isActive: acc.isActive,
          isVerified: acc.isVerified,
          isDefault: acc.isDefault,
          isDefaultString: acc.isDefault ? '✅ DEFAULT' : '❌ NOT DEFAULT'
        });
      }
    });
    
    // Check if there's a default bank account
    const defaultBankAccount = accounts.find(acc => 
      acc.accountType === 'bank_transfer' && acc.isDefault
    );
    if (defaultBankAccount) {
      console.log(`✅ Default bank account for QR: ${defaultBankAccount.accountName} (${defaultBankAccount.bankName} - ${defaultBankAccount.bankAccountNumber})`);
    } else {
      console.warn(`⚠️ No default bank account found for store ${storeId}! Checkout will use first available account.`);
    }

    // Group by account type for easier frontend handling
    const groupedAccounts = {
      bank_transfer: [],
      zalopay: []
    };

    accounts.forEach(account => {
      const accountData = {
        id: account.id,
        accountName: account.accountName,
        isDefault: account.isDefault
      };

      if (account.accountType === 'bank_transfer') {
        // For bank_transfer: Return all active accounts, but mark which one is default
        accountData.bankName = account.bankName;
        accountData.bankAccountNumber = account.bankAccountNumber;
        accountData.bankAccountName = account.bankAccountName;
        groupedAccounts.bank_transfer.push(accountData);
      } else if (account.accountType === 'zalopay') {
        // For ZaloPay: Return all accounts (can have multiple)
        accountData.zaloPayAppId = account.zaloPayAppId;
        groupedAccounts.zalopay.push(accountData);
      }
    });

    res.json({
      success: true,
      data: groupedAccounts
    });
  } catch (error) {
    console.error('Get active payment accounts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get active payment accounts'
    });
  }
};
