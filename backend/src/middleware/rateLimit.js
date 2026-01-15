const SpamLog = require('../models/SpamLog');

/**
 * Rate limiting middleware for order creation
 * Limits orders per IP per store within a time window
 */
const createOrderRateLimit = (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress ||
                     (req.socket && req.socket.remoteAddress) ||
                     (req.connection && req.connection.remoteAddress) || 'unknown';

    // Normalize IPv4-mapped IPv6 addresses
    const normalizedIP = clientIP.replace(/^::ffff:/, '');

    const storeId = req.body.storeId;
    const now = Date.now();

    // Rate limit configuration
    const MAX_ORDERS = 5; // Maximum orders per window
    const WINDOW_MS = 10 * 60 * 1000; // 10 minutes window

    // In-memory storage for rate limiting
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const store = global.rateLimitStore;
    const key = `${normalizedIP}:${storeId}`;

    // Get or create rate limit data for this IP+storeId
    let rateData = store.get(key);
    if (!rateData) {
      rateData = {
        orders: [],
        blockedUntil: null
      };
      store.set(key, rateData);
    }

    // Clean up old entries (older than window)
    rateData.orders = rateData.orders.filter(timestamp => now - timestamp < WINDOW_MS);

    // Check if currently blocked
    if (rateData.blockedUntil && now < rateData.blockedUntil) {
      const remainingBlockTime = Math.ceil((rateData.blockedUntil - now) / 1000 / 60); // minutes

      // Log spam attempt
      SpamLog.create({
        ip: normalizedIP,
        storeId: storeId,
        action: 'rate_limit_blocked',
        details: {
          remainingBlockTime,
          ordersInWindow: rateData.orders.length,
          maxOrders: MAX_ORDERS
        }
      }).catch(err => console.error('Failed to log spam attempt:', err));

      return res.status(429).json({
        success: false,
        message: `Bạn đang đặt quá nhiều đơn. Vui lòng thử lại sau ${remainingBlockTime} phút.`
      });
    }

    // Check rate limit
    if (rateData.orders.length >= MAX_ORDERS) {
      // Block for 10 minutes on rate limit violation
      rateData.blockedUntil = now + (10 * 60 * 1000); // 10 minutes

      // Log rate limit violation
      SpamLog.create({
        ip: normalizedIP,
        storeId: storeId,
        action: 'rate_limit_exceeded',
        details: {
          ordersInWindow: rateData.orders.length,
          maxOrders: MAX_ORDERS,
          windowMinutes: WINDOW_MS / 1000 / 60,
          blockedMinutes: 10
        }
      }).catch(err => console.error('Failed to log rate limit violation:', err));

      return res.status(429).json({
        success: false,
        message: 'Bạn đang đặt quá nhiều đơn. Vui lòng thử lại sau 10 phút.'
      });
    }

    // Add current request to the window
    rateData.orders.push(now);

    // Clean up expired entries from memory periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupExpiredEntries(store, WINDOW_MS);
    }

    // Attach rate limit info to request for potential use
    req.rateLimitInfo = {
      ip: normalizedIP,
      storeId: storeId,
      ordersInWindow: rateData.orders.length,
      maxOrders: MAX_ORDERS,
      windowMinutes: WINDOW_MS / 1000 / 60
    };

    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // Continue on error to avoid blocking legitimate requests
    next();
  }
};

/**
 * Clean up expired entries from rate limit store
 */
const cleanupExpiredEntries = (store, windowMs) => {
  try {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, data] of store.entries()) {
      // Clean up old orders
      data.orders = data.orders.filter(timestamp => now - timestamp < windowMs);

      // Remove entry if no orders and not blocked
      if (data.orders.length === 0 && (!data.blockedUntil || now >= data.blockedUntil)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => store.delete(key));
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

/**
 * Get rate limit status for an IP and store
 */
const getRateLimitStatus = (ip, storeId) => {
  if (!global.rateLimitStore) return null;

  const normalizedIP = ip.replace(/^::ffff:/, '');
  const key = `${normalizedIP}:${storeId}`;
  const rateData = global.rateLimitStore.get(key);

  if (!rateData) return null;

  const now = Date.now();
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const MAX_ORDERS = 5;

  // Clean up old entries
  rateData.orders = rateData.orders.filter(timestamp => now - timestamp < WINDOW_MS);

  return {
    ordersInWindow: rateData.orders.length,
    maxOrders: MAX_ORDERS,
    windowMinutes: WINDOW_MS / 1000 / 60,
    isBlocked: rateData.blockedUntil && now < rateData.blockedUntil,
    blockedUntil: rateData.blockedUntil,
    remainingBlockMinutes: rateData.blockedUntil ? Math.ceil((rateData.blockedUntil - now) / 1000 / 60) : 0
  };
};

module.exports = {
  createOrderRateLimit,
  getRateLimitStatus,
  cleanupExpiredEntries
};
