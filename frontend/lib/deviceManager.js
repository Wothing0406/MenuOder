/**
 * Device Manager - handles device ID generation and management for anti-spam protection
 */

const DEVICE_ID_KEY = 'menu_order_device_id';
const DEVICE_ID_EXPIRY_KEY = 'menu_order_device_id_expiry';

// Device ID expiry time (30 days)
const DEVICE_ID_EXPIRY = 30 * 24 * 60 * 60 * 1000;

/**
 * Generate a unique device ID
 */
function generateDeviceId() {
  // Use crypto.randomUUID if available (modern browsers), fallback to random string
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers or environments without crypto.randomUUID
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${random2}`;
}

/**
 * Get or create device ID
 */
export function getDeviceId() {
  try {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const storedId = localStorage.getItem(DEVICE_ID_KEY);
    const expiry = localStorage.getItem(DEVICE_ID_EXPIRY_KEY);

    // Check if stored ID is still valid
    if (storedId && expiry) {
      const expiryTime = parseInt(expiry);
      if (Date.now() < expiryTime) {
        return storedId;
      }
    }

    // Generate new device ID
    const newDeviceId = generateDeviceId();
    const newExpiry = Date.now() + DEVICE_ID_EXPIRY;

    // Store in localStorage
    localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
    localStorage.setItem(DEVICE_ID_EXPIRY_KEY, newExpiry.toString());

    return newDeviceId;
  } catch (error) {
    console.warn('Failed to manage device ID:', error);
    // Return a temporary ID if localStorage fails
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Clear stored device ID (for testing or user request)
 */
export function clearDeviceId() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEVICE_ID_KEY);
      localStorage.removeItem(DEVICE_ID_EXPIRY_KEY);
    }
  } catch (error) {
    console.warn('Failed to clear device ID:', error);
  }
}

/**
 * Get device info for API requests
 */
export function getDeviceInfo() {
  const deviceId = getDeviceId();
  return {
    deviceId,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    timestamp: Date.now()
  };
}

/**
 * Check if device ID is about to expire (within 7 days)
 */
export function isDeviceIdExpiringSoon() {
  try {
    if (typeof window === 'undefined') return false;

    const expiry = localStorage.getItem(DEVICE_ID_EXPIRY_KEY);
    if (!expiry) return true;

    const expiryTime = parseInt(expiry);
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);

    return expiryTime < sevenDaysFromNow;
  } catch (error) {
    return true;
  }
}

/**
 * Refresh device ID expiry
 */
export function refreshDeviceIdExpiry() {
  try {
    if (typeof window === 'undefined') return;

    const storedId = localStorage.getItem(DEVICE_ID_KEY);
    if (storedId) {
      const newExpiry = Date.now() + DEVICE_ID_EXPIRY;
      localStorage.setItem(DEVICE_ID_EXPIRY_KEY, newExpiry.toString());
    }
  } catch (error) {
    console.warn('Failed to refresh device ID expiry:', error);
  }
}
