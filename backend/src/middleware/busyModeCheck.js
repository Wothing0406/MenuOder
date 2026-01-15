const Store = require('../models/Store');
const Order = require('../models/Order');
const SpamLog = require('../models/SpamLog');
const { sequelize, Sequelize } = require('../config/database');
const Op = Sequelize.Op;

/**
 * Middleware to check if store is in busy mode (manually or automatically)
 */
const busyModeCheck = async (req, res, next) => {
  try {
    const storeId = req.body.storeId;

    if (!storeId) {
      return next(); // Let validation middleware handle missing storeId
    }

    const store = await Store.findByPk(storeId, {
      attributes: [
        'id', 'storeName', 'isBusyModeEnabled', 'maxOrdersPerWindow',
        'timeWindowMinutes', 'busyModeStartTime', 'is_open'
      ]
    });

    if (!store) {
      return next(); // Let validation middleware handle invalid storeId
    }

    // Check manual busy mode
    if (store.isBusyModeEnabled) {
      await SpamLog.create({
        storeId: storeId,
        action: 'busy_mode_manual_block',
        details: {
          storeName: store.storeName,
          busyModeEnabled: true
        }
      });

      return res.status(503).json({
        success: false,
        message: 'Quán hiện đang quá tải, vui lòng đặt lại sau ít phút.',
        busyMode: true,
        manualBusyMode: true
      });
    }

    // Check automatic busy mode based on recent orders
    const isAutoBusy = await checkAutomaticBusyMode(store);
    if (isAutoBusy) {
      // Update store busy mode start time if not set
      if (!store.busyModeStartTime) {
        await store.update({ busyModeStartTime: new Date() });
      }

      await SpamLog.create({
        storeId: storeId,
        action: 'busy_mode_auto_block',
        details: {
          storeName: store.storeName,
          maxOrdersPerWindow: store.maxOrdersPerWindow,
          timeWindowMinutes: store.timeWindowMinutes,
          isAutoBusy: true
        }
      });

      return res.status(503).json({
        success: false,
        message: 'Quán hiện đang quá tải, vui lòng đặt lại sau ít phút.',
        busyMode: true,
        autoBusyMode: true,
        estimatedWaitMinutes: store.timeWindowMinutes
      });
    }

    // Store is not busy, reset busy mode start time if it was set
    if (store.busyModeStartTime) {
      await store.update({ busyModeStartTime: null });
    }

    // Attach busy mode info to request
    req.busyModeInfo = {
      storeId: storeId,
      isBusy: false,
      maxOrdersPerWindow: store.maxOrdersPerWindow,
      timeWindowMinutes: store.timeWindowMinutes
    };

    next();
  } catch (error) {
    console.error('Busy mode check error:', error);

    // Log error but don't block the request
    await SpamLog.create({
      storeId: req.body.storeId,
      action: 'busy_mode_check_error',
      details: {
        error: error.message,
        stack: error.stack
      }
    }).catch(err => console.error('Failed to log busy mode check error:', err));

    // Continue on error to avoid blocking legitimate requests
    next();
  }
};

/**
 * Check if store should be in automatic busy mode based on recent orders
 */
const checkAutomaticBusyMode = async (store) => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (store.timeWindowMinutes * 60 * 1000));

    // Count orders in the time window
    const recentOrderCount = await Order.count({
      where: {
        storeId: store.id,
        createdAt: {
          [Op.gte]: windowStart
        },
        status: {
          [Op.notIn]: ['completed', 'cancelled'] // Count active/in-progress orders
        }
      }
    });

    return recentOrderCount >= store.maxOrdersPerWindow;
  } catch (error) {
    console.error('Error checking automatic busy mode:', error);
    return false; // Default to not busy on error
  }
};

/**
 * Get busy mode status for a store
 */
const getBusyModeStatus = async (storeId) => {
  try {
    const store = await Store.findByPk(storeId, {
      attributes: [
        'id', 'storeName', 'isBusyModeEnabled', 'maxOrdersPerWindow',
        'timeWindowMinutes', 'busyModeStartTime'
      ]
    });

    if (!store) return null;

    const isAutoBusy = await checkAutomaticBusyMode(store);
    const isBusy = store.isBusyModeEnabled || isAutoBusy;

    let recentOrderCount = 0;
    if (!isBusy) {
      const now = new Date();
      const windowStart = new Date(now.getTime() - (store.timeWindowMinutes * 60 * 1000));

      recentOrderCount = await Order.count({
        where: {
          storeId: store.id,
          createdAt: {
            [Op.gte]: windowStart
          },
          status: {
            [Op.notIn]: ['completed', 'cancelled']
          }
        }
      });
    }

    return {
      storeId: store.id,
      storeName: store.storeName,
      isBusy,
      manualBusyMode: store.isBusyModeEnabled,
      autoBusyMode: isAutoBusy,
      maxOrdersPerWindow: store.maxOrdersPerWindow,
      timeWindowMinutes: store.timeWindowMinutes,
      busyModeStartTime: store.busyModeStartTime,
      currentOrdersInWindow: recentOrderCount,
      canAcceptOrders: !isBusy
    };
  } catch (error) {
    console.error('Error getting busy mode status:', error);
    return null;
  }
};

/**
 * Manually set busy mode for a store (admin function)
 */
const setBusyMode = async (storeId, enabled, adminUserId = null) => {
  try {
    const updateData = {
      isBusyModeEnabled: enabled
    };

    if (!enabled) {
      updateData.busyModeStartTime = null;
    } else {
      updateData.busyModeStartTime = new Date();
    }

    const [affectedRows] = await Store.update(updateData, {
      where: { id: storeId }
    });

    if (affectedRows > 0) {
      // Log the action
      await SpamLog.create({
        storeId: storeId,
        action: enabled ? 'busy_mode_manual_enabled' : 'busy_mode_manual_disabled',
        details: {
          adminUserId,
          enabled
        }
      });
    }

    return affectedRows > 0;
  } catch (error) {
    console.error('Error setting busy mode:', error);
    return false;
  }
};

/**
 * Update busy mode configuration for a store
 */
const updateBusyModeConfig = async (storeId, config, adminUserId = null) => {
  try {
    const { maxOrdersPerWindow, timeWindowMinutes } = config;

    // Validate configuration
    if (maxOrdersPerWindow < 1 || maxOrdersPerWindow > 1000) {
      throw new Error('maxOrdersPerWindow must be between 1 and 1000');
    }

    if (timeWindowMinutes < 1 || timeWindowMinutes > 1440) { // Max 24 hours
      throw new Error('timeWindowMinutes must be between 1 and 1440');
    }

    const [affectedRows] = await Store.update({
      maxOrdersPerWindow,
      timeWindowMinutes
    }, {
      where: { id: storeId }
    });

    if (affectedRows > 0) {
      // Log the configuration change
      await SpamLog.create({
        storeId: storeId,
        action: 'busy_mode_config_updated',
        details: {
          adminUserId,
          newConfig: { maxOrdersPerWindow, timeWindowMinutes }
        }
      });
    }

    return affectedRows > 0;
  } catch (error) {
    console.error('Error updating busy mode config:', error);
    return false;
  }
};

module.exports = {
  busyModeCheck,
  checkAutomaticBusyMode,
  getBusyModeStatus,
  setBusyMode,
  updateBusyModeConfig
};
