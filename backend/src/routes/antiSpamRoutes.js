const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const autoBlockService = require('../utils/autoBlockService');
const BlockedIP = require('../models/BlockedIP');
const BlockedDevice = require('../models/BlockedDevice');
const SpamLog = require('../models/SpamLog');
const { getRateLimitStatus } = require('../middleware/rateLimit');
const { getDeviceStatus } = require('../middleware/deviceSpamCheck');
const { getBusyModeStatus, setBusyMode, updateBusyModeConfig } = require('../middleware/busyModeCheck');
const { sequelize, Sequelize } = require('../config/database');
const Op = Sequelize.Op;

// All routes require authentication
router.use(authMiddleware);

// Get anti-spam statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats, blockStats] = await Promise.all([
      autoBlockService.getBlockStats(),
      getDetailedStats()
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        ...blockStats
      }
    });
  } catch (error) {
    console.error('Error getting anti-spam stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get anti-spam statistics'
    });
  }
});

// Get blocked IPs
router.get('/blocked-ips', async (req, res) => {
  try {
    const blockedIPs = await BlockedIP.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: blockedIPs
    });
  } catch (error) {
    console.error('Error getting blocked IPs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked IPs'
    });
  }
});

// Get blocked devices
router.get('/blocked-devices', async (req, res) => {
  try {
    const blockedDevices = await BlockedDevice.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: blockedDevices
    });
  } catch (error) {
    console.error('Error getting blocked devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked devices'
    });
  }
});

// Manually block an IP
router.post('/block-ip', async (req, res) => {
  try {
    const { ip, reason, durationMinutes } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }

    const success = await autoBlockService.manualBlockIP(ip, reason, durationMinutes);

    if (success) {
      res.json({
        success: true,
        message: `IP ${ip} has been blocked`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to block IP'
      });
    }
  } catch (error) {
    console.error('Error blocking IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block IP'
    });
  }
});

// Manually block a device
router.post('/block-device', async (req, res) => {
  try {
    const { deviceId, reason, durationMinutes } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    const success = await autoBlockService.manualBlockDevice(deviceId, reason, durationMinutes);

    if (success) {
      res.json({
        success: true,
        message: `Device ${deviceId} has been blocked`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to block device'
      });
    }
  } catch (error) {
    console.error('Error blocking device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block device'
    });
  }
});

// Unblock an IP
router.post('/unblock-ip', async (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }

    const success = await autoBlockService.unblockIP(ip);

    if (success) {
      res.json({
        success: true,
        message: `IP ${ip} has been unblocked`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'IP not found or not blocked'
      });
    }
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock IP'
    });
  }
});

// Unblock a device
router.post('/unblock-device', async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    const success = await autoBlockService.unblockDevice(deviceId);

    if (success) {
      res.json({
        success: true,
        message: `Device ${deviceId} has been unblocked`
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Device not found or not blocked'
      });
    }
  } catch (error) {
    console.error('Error unblocking device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock device'
    });
  }
});

// Get spam logs
router.get('/spam-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, ip, deviceId, storeId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (ip) where.ip = ip;
    if (deviceId) where.deviceId = deviceId;
    if (storeId) where.storeId = storeId;

    const { count, rows } = await SpamLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting spam logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spam logs'
    });
  }
});

// Get rate limit status for an IP
router.get('/rate-limit-status', async (req, res) => {
  try {
    const { ip, storeId } = req.query;

    if (!ip || !storeId) {
      return res.status(400).json({
        success: false,
        message: 'IP and storeId are required'
      });
    }

    const status = getRateLimitStatus(ip, storeId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limit status'
    });
  }
});

// Get device status
router.get('/device-status', async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    const status = await getDeviceStatus(deviceId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting device status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device status'
    });
  }
});

// Get busy mode status for a store
router.get('/busy-mode-status/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const status = await getBusyModeStatus(storeId);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting busy mode status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get busy mode status'
    });
  }
});

// Set busy mode for a store
router.post('/busy-mode/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled must be a boolean'
      });
    }

    const success = await setBusyMode(storeId, enabled, req.user?.id);

    if (success) {
      res.json({
        success: true,
        message: `Busy mode ${enabled ? 'enabled' : 'disabled'} for store ${storeId}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update busy mode'
      });
    }
  } catch (error) {
    console.error('Error setting busy mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set busy mode'
    });
  }
});

// Update busy mode configuration for a store
router.put('/busy-mode-config/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { maxOrdersPerWindow, timeWindowMinutes } = req.body;

    const success = await updateBusyModeConfig(storeId, {
      maxOrdersPerWindow,
      timeWindowMinutes
    }, req.user?.id);

    if (success) {
      res.json({
        success: true,
        message: 'Busy mode configuration updated'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update busy mode configuration'
      });
    }
  } catch (error) {
    console.error('Error updating busy mode config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update busy mode configuration'
    });
  }
});

// Helper function to get detailed statistics
async function getDetailedStats() {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      totalBlockedIPs,
      totalBlockedDevices,
      spamLogsLast24h,
      spamLogsLastHour,
      rateLimitViolations,
      deviceSpamAttempts,
      busyModeBlocks
    ] = await Promise.all([
      BlockedIP.count(),
      BlockedDevice.count(),
      SpamLog.count({ where: { createdAt: { [Op.gte]: last24h } } }),
      SpamLog.count({ where: { createdAt: { [Op.gte]: lastHour } } }),
      SpamLog.count({ where: { action: 'rate_limit_exceeded', createdAt: { [Op.gte]: last24h } } }),
      SpamLog.count({ where: { action: 'device_spam_attempt', createdAt: { [Op.gte]: last24h } } }),
      SpamLog.count({ where: { action: 'busy_mode_auto_block', createdAt: { [Op.gte]: last24h } } })
    ]);

    return {
      totalBlockedIPs,
      totalBlockedDevices,
      spamLogsLast24h,
      spamLogsLastHour,
      rateLimitViolationsLast24h: rateLimitViolations,
      deviceSpamAttemptsLast24h: deviceSpamAttempts,
      busyModeBlocksLast24h: busyModeBlocks
    };
  } catch (error) {
    console.error('Error getting detailed stats:', error);
    return {};
  }
}

module.exports = router;
