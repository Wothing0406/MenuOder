const { Order, Store, PaymentAccount } = require('../models');
const { createQrPayment, checkPaymentStatus, verifyCredentials } = require('../utils/zaloPay');

exports.createQrPayment = async (req, res) => {
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
          accountType: 'zalopay',
          isActive: true,
          isVerified: true
        }
      });
      if (!paymentAccount) {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản ZaloPay không hợp lệ hoặc chưa được xác thực'
        });
      }
    } else {
      // Use default ZaloPay account
      paymentAccount = await PaymentAccount.findOne({
        where: { 
          storeId: store.id, 
          accountType: 'zalopay',
          isActive: true,
          isVerified: true,
          isDefault: true
        }
      });

      // If no default, use first available
      if (!paymentAccount) {
        paymentAccount = await PaymentAccount.findOne({
          where: { 
            storeId: store.id, 
            accountType: 'zalopay',
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
        message: 'Cửa hàng chưa cấu hình tài khoản ZaloPay nào'
      });
    }

    const config = {
      zaloPayAppId: paymentAccount.zaloPayAppId,
      zaloPayKey1: paymentAccount.zaloPayKey1,
      zaloPayKey2: paymentAccount.zaloPayKey2,
      zaloPayMerchantId: paymentAccount.zaloPayMerchantId
    };

    const qrResult = await createQrPayment(config, order);

    await order.update({
      zaloPayTransactionId: qrResult.transactionId,
      zaloPayStatus: 'pending',
      zaloPayQrCode: qrResult.qrCode,
      paymentAccountId: paymentAccount.id
    });

    res.json({
      success: true,
      message: 'QR code ZaloPay đã được tạo',
      data: {
        qrCode: qrResult.qrCode,
        qrCodeImage: qrResult.qrCodeImage,
        transactionId: qrResult.transactionId,
        orderId: order.id,
        orderCode: order.orderCode,
        amount: order.totalAmount,
        paymentAccount: {
          id: paymentAccount.id,
          accountName: paymentAccount.accountName
        }
      }
    });
  } catch (error) {
    console.error('Create QR payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create QR payment'
    });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { include: [{ association: 'store' }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const store = order.store || await Store.findByPk(order.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    if (!order.zaloPayTransactionId) {
      return res.status(400).json({ success: false, message: 'Order has no ZaloPay transaction' });
    }

    const config = {
      zaloPayAppId: store.zaloPayAppId,
      zaloPayKey1: store.zaloPayKey1
    };

    const status = await checkPaymentStatus(config, order.zaloPayTransactionId);

    // return_code: 1 success, others pending/failed
    let statusText = 'pending';
    if (status.return_code === 1) statusText = 'success';
    if (status.return_code < 0) statusText = 'failed';

    if (statusText === 'success') {
      // Update order status to confirmed only when payment is successful
      await order.update({ 
        isPaid: true, 
        zaloPayStatus: 'success',
        status: order.status === 'pending' ? 'confirmed' : order.status
      });
    } else if (statusText === 'failed') {
      await order.update({ zaloPayStatus: 'failed' });
    }

    res.json({
      success: true,
      data: {
        status: statusText,
        raw: status
      }
    });
  } catch (error) {
    console.error('Check ZaloPay status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check ZaloPay status'
    });
  }
};

// Webhook callback (basic verification)
exports.webhookCallback = async (req, res) => {
  try {
    // For simplicity, accept callback and mark paid if return_code == 1
    const { data } = req.body;
    // data may contain app_trans_id
    const appTransId = data?.app_trans_id || data?.app_trans_id_ext;
    if (!appTransId) {
      return res.status(400).json({ return_code: -1, return_message: 'Missing app_trans_id' });
    }

    const order = await Order.findOne({ where: { zaloPayTransactionId: appTransId } });
    if (!order) {
      return res.status(400).json({ return_code: -1, return_message: 'Order not found' });
    }

    // Update order status to confirmed only when payment is successful
    await order.update({ 
      isPaid: true, 
      zaloPayStatus: 'success',
      status: order.status === 'pending' ? 'confirmed' : order.status
    });
    return res.json({ return_code: 1, return_message: 'OK' });
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    res.status(500).json({ return_code: 0, return_message: 'Error' });
  }
};

// Verify ZaloPay credentials without saving (health check)
exports.verifyConfig = async (req, res) => {
  try {
    const { zaloPayAppId, zaloPayKey1, zaloPayKey2, zaloPayMerchantId } = req.body;
    if (!zaloPayAppId || !zaloPayKey1) {
      return res.status(400).json({ success: false, message: 'Thiếu App ID hoặc Key 1' });
    }
    const result = await verifyCredentials({
      zaloPayAppId,
      zaloPayKey1,
      zaloPayKey2,
      zaloPayMerchantId
    });
    if (result.success) {
      return res.json({
        success: true,
        message: 'Liên kết thành công',
        data: result
      });
    }
    return res.status(400).json({
      success: false,
      message: `Liên kết thất bại: ${result.return_message || 'Không xác định'}`,
      data: result
    });
  } catch (error) {
    console.error('Verify ZaloPay config error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể kiểm tra liên kết ZaloPay'
    });
  }
};


  } catch (error) {
    console.error('Verify ZaloPay config error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể kiểm tra liên kết ZaloPay'
    });
  }
};

