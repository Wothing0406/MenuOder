const { Order, Store, PaymentAccount } = require('../models');
const { generateBankTransferQR } = require('../utils/bankTransferQR');

/**
 * Create Bank Transfer QR code for an order
 */
exports.createBankTransferQR = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentAccountId } = req.body; // Optional: specific payment account

    const order = await Order.findByPk(orderId, { 
      include: [
        { association: 'store' },
        { association: 'paymentAccount' }
      ] 
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const store = order.store || await Store.findByPk(order.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' });
    }

    let paymentAccount = null;

    // Use specific payment account if provided
    if (paymentAccountId) {
      paymentAccount = await PaymentAccount.findOne({
        where: { 
          id: paymentAccountId, 
          storeId: store.id, 
          accountType: 'bank_transfer',
          isActive: true
          // Allow unverified accounts if store owner has enabled them
        }
      });
      if (!paymentAccount) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản thanh toán không hợp lệ hoặc chưa được kích hoạt'
        });
      }
    } else {
      // Use default bank transfer account
      paymentAccount = await PaymentAccount.findOne({
        where: { 
          storeId: store.id, 
          accountType: 'bank_transfer',
          isActive: true,
          isDefault: true
        }
      });

      // If no default, use first available
      if (!paymentAccount) {
        paymentAccount = await PaymentAccount.findOne({
          where: { 
            storeId: store.id, 
            accountType: 'bank_transfer',
            isActive: true
          },
          order: [['isVerified', 'DESC'], ['createdAt', 'ASC']] // Prefer verified, but allow unverified
        });
      }
    }

    if (!paymentAccount) {
      return res.status(400).json({
        success: false,
        message: 'Cửa hàng chưa cấu hình tài khoản chuyển khoản nào'
      });
    }

    const bankInfo = {
      bankAccountNumber: paymentAccount.bankAccountNumber,
      bankAccountName: paymentAccount.bankAccountName,
      bankName: paymentAccount.bankName,
      bankCode: paymentAccount.bankCode
    };

    console.log('Creating QR with bank info:', {
      accountNumber: bankInfo.bankAccountNumber,
      accountNumberLength: bankInfo.bankAccountNumber?.length,
      accountName: bankInfo.bankAccountName,
      bankName: bankInfo.bankName,
      bankCode: bankInfo.bankCode
    });

    const qrResult = await generateBankTransferQR(bankInfo, order);

    // Save QR code and payment account to order
    await order.update({
      bankTransferQRCode: qrResult.qrCodeImage || qrResult.qrCode,
      paymentAccountId: paymentAccount.id
    });

    res.json({
      success: true,
      message: 'QR code chuyển khoản đã được tạo',
      data: {
        qrCode: qrResult.qrCode,
        qrCodeImage: qrResult.qrCodeImage,
        bankInfo: qrResult.bankInfo,
        amount: qrResult.amount,
        content: qrResult.content,
        orderId: order.id,
        orderCode: order.orderCode,
        paymentAccount: {
          id: paymentAccount.id,
          accountName: paymentAccount.accountName
        }
      }
    });
  } catch (error) {
    console.error('Create Bank Transfer QR error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Bank Transfer QR'
    });
  }
};

/**
 * Get bank transfer info for display (without generating QR)
 */
exports.getBankTransferInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, { 
      include: [
        { association: 'store' },
        { association: 'paymentAccount' }
      ] 
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const store = order.store || await Store.findByPk(order.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    // Use payment account from order if available
    let paymentAccount = order.paymentAccount;
    
    if (!paymentAccount) {
      // Find default or first available bank transfer account
      paymentAccount = await PaymentAccount.findOne({
        where: { 
          storeId: store.id, 
          accountType: 'bank_transfer',
          isActive: true,
          isVerified: true,
          isDefault: true
        }
      });

      if (!paymentAccount) {
        paymentAccount = await PaymentAccount.findOne({
          where: { 
            storeId: store.id, 
            accountType: 'bank_transfer',
            isActive: true,
            isVerified: true
          },
          order: [['createdAt', 'ASC']]
        });
      }
    }

    if (!paymentAccount) {
      return res.status(400).json({
        success: false,
        message: 'Cửa hàng chưa cấu hình chuyển khoản QR'
      });
    }

    res.json({
      success: true,
      data: {
        bankAccountNumber: paymentAccount.bankAccountNumber,
        bankAccountName: paymentAccount.bankAccountName,
        bankName: paymentAccount.bankName,
        amount: order.totalAmount,
        orderCode: order.orderCode,
        content: `Thanh toan don hang ${order.orderCode}`,
        paymentAccount: {
          id: paymentAccount.id,
          accountName: paymentAccount.accountName
        }
      }
    });
  } catch (error) {
    console.error('Get Bank Transfer Info error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get bank transfer info'
    });
  }
};

/**
 * Generate preview QR code without creating an order
 * Used for checkout preview - shows QR code based on current cart total
 */
exports.generatePreviewQR = async (req, res) => {
  try {
    const { storeId, amount, paymentAccountId } = req.body;

    if (!storeId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Store ID và số tiền là bắt buộc'
      });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    let paymentAccount = null;

    // Use specific payment account if provided
    if (paymentAccountId) {
      paymentAccount = await PaymentAccount.findOne({
        where: { 
          id: paymentAccountId, 
          storeId: store.id, 
          accountType: 'bank_transfer',
          isActive: true
        }
      });
    } else {
      // Use default bank transfer account
      paymentAccount = await PaymentAccount.findOne({
        where: { 
          storeId: store.id, 
          accountType: 'bank_transfer',
          isActive: true,
          isDefault: true
        }
      });

      // If no default, use first available
      if (!paymentAccount) {
        paymentAccount = await PaymentAccount.findOne({
          where: { 
            storeId: store.id, 
            accountType: 'bank_transfer',
            isActive: true
          },
          order: [['isVerified', 'DESC'], ['createdAt', 'ASC']]
        });
      }
    }

    if (!paymentAccount) {
      return res.status(400).json({
        success: false,
        message: 'Cửa hàng chưa cấu hình tài khoản chuyển khoản nào'
      });
    }

    const bankInfo = {
      bankAccountNumber: paymentAccount.bankAccountNumber,
      bankAccountName: paymentAccount.bankAccountName,
      bankName: paymentAccount.bankName,
      bankCode: paymentAccount.bankCode
    };

    // Create a mock order object for QR generation
    const mockOrder = {
      totalAmount: parseFloat(amount),
      orderCode: 'PREVIEW'
    };

    const qrResult = await generateBankTransferQR(bankInfo, mockOrder);

    res.json({
      success: true,
      message: 'QR code preview đã được tạo',
      data: {
        qrCode: qrResult.qrCode,
        qrCodeImage: qrResult.qrCodeImage,
        bankInfo: qrResult.bankInfo,
        amount: qrResult.amount,
        paymentAccount: {
          id: paymentAccount.id,
          accountName: paymentAccount.accountName
        }
      }
    });
  } catch (error) {
    console.error('Generate preview QR error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate preview QR'
    });
  }
};

/**
 * Lookup account name by account number and bank code
 */
exports.lookupAccountName = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.query;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Số tài khoản và mã ngân hàng là bắt buộc'
      });
    }

    // Use bank account verification utility
    const { verifyBankAccount } = require('../utils/bankAccountVerification');
    
    // Call verification with empty account name to just get the lookup result
    const verification = await verifyBankAccount(
      accountNumber.trim(),
      bankCode.trim(),
      '' // Empty name, we just want to lookup
    );

    if (verification.success && verification.accountName) {
      return res.json({
        success: true,
        accountName: verification.accountName,
        available: true
      });
    } else if (verification.success && verification.lookupAccountName) {
      return res.json({
        success: true,
        accountName: verification.lookupAccountName,
        available: true
      });
    } else {
      return res.json({
        success: false,
        message: verification.error || 'Không tìm thấy thông tin tài khoản',
        available: false
      });
    }
  } catch (error) {
    console.error('Lookup account name error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tra cứu tên chủ tài khoản',
      available: false
    });
  }
};

/**
 * Confirm payment - Customer confirms they have transferred money
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, { include: [{ association: 'store' }] });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.json({
        success: true,
        message: 'Đơn hàng đã được thanh toán trước đó',
        data: { orderId: order.id, orderCode: order.orderCode, isPaid: true }
      });
    }

    // Mark order as paid
    await order.update({
      isPaid: true,
      status: order.status === 'pending' ? 'confirmed' : order.status
    });

    // Log for revenue tracking
    console.log(`✅ Payment confirmed for Order #${order.orderCode} - Amount: ${order.totalAmount} VND`);

    res.json({
      success: true,
      message: 'Đã xác nhận thanh toán thành công. Đơn hàng sẽ được xử lý sớm nhất.',
      data: {
        orderId: order.id,
        orderCode: order.orderCode,
        isPaid: true,
        amount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment'
    });
  }
};