const axios = require('axios');
const QRCode = require('qrcode');

const ZALOPAY_SANDBOX_URL = 'https://sb-openapi.zalopay.vn/v2';
const ZALOPAY_PRODUCTION_URL = 'https://openapi.zalopay.vn/v2';

function generateMac(orderData, key1) {
  const data = [
    orderData.app_id,
    orderData.app_trans_id,
    orderData.app_user,
    orderData.amount,
    orderData.app_time,
    orderData.embed_data,
    orderData.item
  ].join('|');
  return require('crypto').createHmac('sha256', key1).update(data).digest('hex');
}

async function createQrPayment(config, order) {
  const { zaloPayAppId, zaloPayKey1, zaloPayMerchantId } = config;

  if (!zaloPayAppId || !zaloPayKey1) {
    throw new Error('ZaloPay configuration is incomplete: App ID and Key 1 are required');
  }

  const appId = zaloPayAppId;
  const key1 = zaloPayKey1;
  const merchantId = zaloPayMerchantId || appId;

  const apiUrl = process.env.NODE_ENV === 'production' ? ZALOPAY_PRODUCTION_URL : ZALOPAY_SANDBOX_URL;

  const timestamp = Date.now();
  const transId = `ORDER_${order.id}_${timestamp}`;
  const amount = Math.round(parseFloat(order.totalAmount) * 100); // VND to xu

  const orderData = {
    app_id: appId,
    app_trans_id: transId,
    app_user: order.customerPhone || order.customerEmail || `customer_${order.id}`,
    app_time: timestamp,
    amount,
    description: `Thanh toan don hang ${order.orderCode}`,
    item: JSON.stringify([{
      itemid: order.orderCode,
      itemname: `Đơn hàng ${order.orderCode}`,
      itemprice: amount,
      itemquantity: 1
    }]),
    embed_data: JSON.stringify({
      ...(merchantId ? { merchantinfo: merchantId } : {}),
      orderid: order.id.toString(),
      storeid: order.storeId.toString()
    }),
    bank_code: 'zalopayapp'
  };

  orderData.mac = generateMac(orderData, key1);

  const response = await axios.post(`${apiUrl}/create`, orderData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 30000
  });

  if (response.data && response.data.return_code === 1) {
    const qrData = response.data.qr_code;
    let qrCodeImage = null;
    try {
      qrCodeImage = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300
      });
    } catch (qrError) {
      console.error('Error generating QR code image:', qrError);
    }

    return {
      success: true,
      transactionId: transId,
      qrCode: qrData,
      qrCodeImage,
      orderId: response.data.order_id || null,
      zp_trans_token: response.data.zp_trans_token || null,
      amount: order.totalAmount
    };
  }

  throw new Error(response.data?.return_message || 'Failed to create QR payment');
}

async function checkPaymentStatus(config, appTransId) {
  const { zaloPayAppId, zaloPayKey1 } = config;
  if (!zaloPayAppId || !zaloPayKey1) {
    throw new Error('ZaloPay configuration is incomplete: App ID and Key 1 are required');
  }

  const apiUrl = process.env.NODE_ENV === 'production' ? ZALOPAY_PRODUCTION_URL : ZALOPAY_SANDBOX_URL;
  const data = {
    app_id: zaloPayAppId,
    app_trans_id: appTransId,
  };
  const macData = `${data.app_id}|${data.app_trans_id}|${zaloPayKey1}`;
  data.mac = require('crypto').createHmac('sha256', zaloPayKey1).update(macData).digest('hex');

  const response = await axios.post(`${apiUrl}/query`, data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000
  });

  return response.data;
}

// Simple credential check by calling /create with a tiny test transaction (not persisted)
async function verifyCredentials(config) {
  const { zaloPayAppId, zaloPayKey1, zaloPayMerchantId } = config;
  if (!zaloPayAppId || !zaloPayKey1) {
    throw new Error('ZaloPay configuration is incomplete: App ID and Key 1 are required');
  }

  const appId = zaloPayAppId;
  const key1 = zaloPayKey1;
  const merchantId = zaloPayMerchantId || appId;
  const apiUrl = process.env.NODE_ENV === 'production' ? ZALOPAY_PRODUCTION_URL : ZALOPAY_SANDBOX_URL;
  const timestamp = Date.now();
  const transId = `TEST_${timestamp}`;
  const amount = 1; // 1 VND (ZaloPay expects xu; we send already in VND->xu below)

  const orderData = {
    app_id: appId,
    app_trans_id: transId,
    app_user: 'health_check',
    app_time: timestamp,
    amount: amount,
    description: 'Health check ZaloPay credentials',
    item: JSON.stringify([]),
    embed_data: JSON.stringify({
      ...(merchantId ? { merchantinfo: merchantId } : {})
    }),
    bank_code: 'zalopayapp'
  };
  orderData.mac = generateMac(orderData, key1);

  const response = await axios.post(`${apiUrl}/create`, orderData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000
  });

  if (response.data && response.data.return_code === 1) {
    return { success: true, return_code: 1, return_message: 'Credentials valid' };
  }
  return { success: false, return_code: response.data?.return_code, return_message: response.data?.return_message || 'Unknown error' };
}

module.exports = {
  createQrPayment,
  checkPaymentStatus,
  verifyCredentials
};

