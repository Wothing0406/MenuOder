const BlockedIP = require('../models/BlockedIP');
const BlockedDevice = require('../models/BlockedDevice');
const SpamLog = require('../models/SpamLog');
const { sequelize, Sequelize } = require('../config/database');
const Op = Sequelize.Op;

/**
 * Auto-block service to detect and block spam behavior
 */
class AutoBlockService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.blockDurationMinutes = 30; // Block for 30 minutes by default
  }

  /**
   * Start the auto-block monitoring service
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🚫 Auto-block service started');

    // Run initial check
    this.performChecks();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.performChecks();
    }, this.checkInterval);
  }

  /**
   * Stop the auto-block monitoring service
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🚫 Auto-block service stopped');
  }

  /**
   * Perform spam detection checks
   */
  async performChecks() {
    try {
      console.log('🔍 Running auto-block checks...');

      await Promise.all([
        this.checkIPSpam(),
        this.checkDeviceSpam(),
        this.cleanupExpiredBlocks()
      ]);

      console.log('✅ Auto-block checks completed');
    } catch (error) {
      console.error('❌ Auto-block check error:', error);
    }
  }

  /**
   * Check for IP addresses with spam behavior
   */
  async checkIPSpam() {
    try {
      // Get IPs with high spam activity in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const spamIPs = await SpamLog.findAll({
        attributes: [
          'ip',
          [sequelize.fn('COUNT', sequelize.col('id')), 'spamCount'],
          [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastSpamTime']
        ],
        where: {
          ip: { [Op.not]: null },
          createdAt: { [Op.gte]: oneHourAgo },
          action: {
            [Op.in]: ['rate_limit_exceeded', 'device_spam_attempt', 'busy_mode_auto_block']
          }
        },
        group: ['ip'],
        having: sequelize.literal('COUNT(id) >= 5'), // 5+ spam actions per hour
        raw: true
      });

      for (const spamIP of spamIPs) {
        await this.blockIP(spamIP.ip, `Auto-blocked for ${spamIP.spamCount} spam actions in 1 hour`);
      }

      if (spamIPs.length > 0) {
        console.log(`🚫 Auto-blocked ${spamIPs.length} IP addresses`);
      }
    } catch (error) {
      console.error('Error checking IP spam:', error);
    }
  }

  /**
   * Check for devices with spam behavior
   */
  async checkDeviceSpam() {
    try {
      // Get devices with high spam activity in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const spamDevices = await SpamLog.findAll({
        attributes: [
          'deviceId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'spamCount'],
          [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastSpamTime']
        ],
        where: {
          deviceId: { [Op.not]: null },
          createdAt: { [Op.gte]: oneHourAgo },
          action: {
            [Op.in]: ['device_spam_attempt', 'rate_limit_exceeded', 'busy_mode_auto_block']
          }
        },
        group: ['deviceId'],
        having: sequelize.literal('COUNT(id) >= 3'), // 3+ spam actions per hour
        raw: true
      });

      for (const spamDevice of spamDevices) {
        await this.blockDevice(spamDevice.deviceId, `Auto-blocked for ${spamDevice.spamCount} spam actions in 1 hour`);
      }

      if (spamDevices.length > 0) {
        console.log(`🚫 Auto-blocked ${spamDevices.length} devices`);
      }
    } catch (error) {
      console.error('Error checking device spam:', error);
    }
  }

  /**
   * Block an IP address
   */
  async blockIP(ip, reason) {
    try {
      const blockedUntil = new Date(Date.now() + (this.blockDurationMinutes * 60 * 1000));

      await BlockedIP.upsert({
        ip: ip,
        reason: reason,
        blockedUntil: blockedUntil
      });

      console.log(`🚫 Blocked IP: ${ip} until ${blockedUntil.toISOString()}`);
    } catch (error) {
      console.error(`Error blocking IP ${ip}:`, error);
    }
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId, reason) {
    try {
      const blockedUntil = new Date(Date.now() + (this.blockDurationMinutes * 60 * 1000));

      await BlockedDevice.upsert({
        deviceId: deviceId,
        reason: reason,
        blockedUntil: blockedUntil
      });

      console.log(`🚫 Blocked device: ${deviceId} until ${blockedUntil.toISOString()}`);
    } catch (error) {
      console.error(`Error blocking device ${deviceId}:`, error);
    }
  }

  /**
   * Clean up expired blocks
   */
  async cleanupExpiredBlocks() {
    try {
      const now = new Date();

      // Clean up expired IP blocks
      const expiredIPs = await BlockedIP.destroy({
        where: {
          blockedUntil: {
            [Op.lt]: now,
            [Op.not]: null
          }
        }
      });

      // Clean up expired device blocks
      const expiredDevices = await BlockedDevice.destroy({
        where: {
          blockedUntil: {
            [Op.lt]: now,
            [Op.not]: null
          }
        }
      });

      if (expiredIPs > 0 || expiredDevices > 0) {
        console.log(`🧹 Cleaned up ${expiredIPs} expired IP blocks and ${expiredDevices} expired device blocks`);
      }
    } catch (error) {
      console.error('Error cleaning up expired blocks:', error);
    }
  }

  /**
   * Manually block an IP (admin function)
   */
  async manualBlockIP(ip, reason, durationMinutes = null) {
    try {
      const blockedUntil = durationMinutes
        ? new Date(Date.now() + (durationMinutes * 60 * 1000))
        : null; // Permanent if no duration

      await BlockedIP.upsert({
        ip: ip,
        reason: reason,
        blockedUntil: blockedUntil
      });

      return true;
    } catch (error) {
      console.error(`Error manually blocking IP ${ip}:`, error);
      return false;
    }
  }

  /**
   * Manually block a device (admin function)
   */
  async manualBlockDevice(deviceId, reason, durationMinutes = null) {
    try {
      const blockedUntil = durationMinutes
        ? new Date(Date.now() + (durationMinutes * 60 * 1000))
        : null; // Permanent if no duration

      await BlockedDevice.upsert({
        deviceId: deviceId,
        reason: reason,
        blockedUntil: blockedUntil
      });

      return true;
    } catch (error) {
      console.error(`Error manually blocking device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Unblock an IP (admin function)
   */
  async unblockIP(ip) {
    try {
      const deleted = await BlockedIP.destroy({
        where: { ip: ip }
      });
      return deleted > 0;
    } catch (error) {
      console.error(`Error unblocking IP ${ip}:`, error);
      return false;
    }
  }

  /**
   * Unblock a device (admin function)
   */
  async unblockDevice(deviceId) {
    try {
      const deleted = await BlockedDevice.destroy({
        where: { deviceId: deviceId }
      });
      return deleted > 0;
    } catch (error) {
      console.error(`Error unblocking device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Get block statistics
   */
  async getBlockStats() {
    try {
      const [activeIPBlocks, activeDeviceBlocks, totalSpamLogs] = await Promise.all([
        BlockedIP.count({
          where: {
            blockedUntil: {
              [Op.or]: {
                [Op.is]: null,
                [Op.gt]: new Date()
              }
            }
          }
        }),
        BlockedDevice.count({
          where: {
            blockedUntil: {
              [Op.or]: {
                [Op.is]: null,
                [Op.gt]: new Date()
              }
            }
          }
        }),
        SpamLog.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      return {
        activeIPBlocks,
        activeDeviceBlocks,
        totalSpamLogsLast24h: totalSpamLogs,
        lastCheckTime: new Date()
      };
    } catch (error) {
      console.error('Error getting block stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const autoBlockService = new AutoBlockService();

module.exports = autoBlockService;
