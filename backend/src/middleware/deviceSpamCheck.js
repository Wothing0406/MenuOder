const Order = require('../models/Order');
const BlockedDevice = require('../models/BlockedDevice');
const SpamLog = require('../models/SpamLog');

/**
 * Middleware to check device spam - ensures only one active order per device
 */
const deviceSpamCheck = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'] || req.body.deviceId;

    if (!deviceId) {
      // For backward compatibility, allow requests without deviceId but log warning
      console.warn('Order creation without deviceId - consider updating frontend');
      req.deviceWarning = 'No deviceId provided';
      return next();
    }

    // Check if device is blocked
    const blockedDevice = await BlockedDevice.findOne({
      where: {
        deviceId: deviceId,
        blockedUntil: {
          [require('../config/database').Sequelize.Op.or]: {
            [require('../config/database').Sequelize.Op.is]: null, // Permanent block
            [require('../config/database').Sequelize.Op.gt]: new Date() // Temporary block not expired
          }
        }
      }
    });

    if (blockedDevice) {
      const remainingTime = blockedDevice.blockedUntil
        ? Math.ceil((blockedDevice.blockedUntil - new Date()) / 1000 / 60) // minutes
        : null;

      // Log blocked attempt
      await SpamLog.create({
        deviceId: deviceId,
        storeId: req.body.storeId,
        action: 'device_blocked_attempt',
        details: {
          reason: blockedDevice.reason,
          isPermanent: !blockedDevice.blockedUntil,
          remainingMinutes: remainingTime
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Hệ thống tạm thời hạn chế thiết bị của bạn do hoạt động bất thường.'
      });
    }

    // Check for active orders from this device
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
    const activeOrder = await Order.findOne({
      where: {
        deviceId: deviceId,
        status: {
          [require('../config/database').Sequelize.Op.in]: activeStatuses
        }
      },
      attributes: ['id', 'orderCode', 'status', 'storeId', 'createdAt']
    });

    if (activeOrder) {
      // Log device spam attempt
      await SpamLog.create({
        deviceId: deviceId,
        storeId: req.body.storeId,
        action: 'device_spam_attempt',
        details: {
          existingOrderId: activeOrder.id,
          existingOrderCode: activeOrder.orderCode,
          existingOrderStatus: activeOrder.status,
          existingStoreId: activeOrder.storeId,
          timeSinceLastOrder: Date.now() - activeOrder.createdAt.getTime()
        }
      });

      return res.status(429).json({
        success: false,
        message: 'Thiết bị của bạn đã có đơn hàng đang xử lý. Vui lòng hoàn tất đơn hiện tại trước khi đặt đơn mới.'
      });
    }

    // Attach device info to request for later use
    req.deviceInfo = {
      deviceId: deviceId,
      isValid: true
    };

    next();
  } catch (error) {
    console.error('Device spam check error:', error);

    // Log error but don't block the request
    await SpamLog.create({
      deviceId: req.headers['x-device-id'] || req.body.deviceId,
      storeId: req.body.storeId,
      action: 'device_check_error',
      details: {
        error: error.message,
        stack: error.stack
      }
    }).catch(err => console.error('Failed to log device check error:', err));

    // Continue on error to avoid blocking legitimate requests
    next();
  }
};

/**
 * Get device status and active orders count
 */
const getDeviceStatus = async (deviceId) => {
  try {
    if (!deviceId) return null;

    // Check if device is blocked
    const blockedDevice = await BlockedDevice.findOne({
      where: {
        deviceId: deviceId,
        blockedUntil: {
          [require('../config/database').Sequelize.Op.or]: {
            [require('../config/database').Sequelize.Op.is]: null,
            [require('../config/database').Sequelize.Op.gt]: new Date()
          }
        }
      }
    });

    // Count active orders
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
    const activeOrderCount = await Order.count({
      where: {
        deviceId: deviceId,
        status: {
          [require('../config/database').Sequelize.Op.in]: activeStatuses
        }
      }
    });

    return {
      deviceId,
      isBlocked: !!blockedDevice,
      blockedUntil: blockedDevice?.blockedUntil,
      activeOrderCount,
      canCreateOrder: !blockedDevice && activeOrderCount === 0
    };
  } catch (error) {
    console.error('Error getting device status:', error);
    return null;
  }
};

module.exports = {
  deviceSpamCheck,
  getDeviceStatus
};
