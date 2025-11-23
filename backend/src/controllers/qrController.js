const QRCode = require('qrcode');
const Store = require('../models/Store');

// Generate QR code
exports.generateQR = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check ownership if authenticated
    if (req.user) {
      if (store.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const storeUrl = `${frontendUrl}/store/${store.storeSlug}`;

    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        storeUrl,
        storeName: store.storeName
      }
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

// Get my store QR code
exports.getMyStoreQR = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const storeUrl = `${frontendUrl}/store/${store.storeSlug}`;

    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        storeUrl,
        storeName: store.storeName
      }
    });
  } catch (error) {
    console.error('Get QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code',
      error: error.message
    });
  }
};
