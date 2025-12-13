const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
// Use OpenStreetMap (FREE) instead of Google Maps
const { extractAddressFromGoogleMapsLink } = require('../utils/openStreetMap');

// Health check endpoint (for uptime monitoring - keeps Render service awake)
router.get('/health', async (req, res) => {
  try {
    // Quick database connection check
    await sequelize.authenticate();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Simple ping endpoint (lightweight, no DB check)
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Extract address from Google Maps link (public)
router.post('/extract-address-from-google-maps', async (req, res) => {
  try {
    const { googleMapsLink } = req.body;

    if (!googleMapsLink || typeof googleMapsLink !== 'string' || !googleMapsLink.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Google Maps link is required'
      });
    }

    const address = await extractAddressFromGoogleMapsLink(googleMapsLink.trim());

    res.json({
      success: true,
      data: {
        address: address
      }
    });
  } catch (error) {
    console.error('Extract address error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to extract address from Google Maps link',
      error: error.message
    });
  }
});

module.exports = router;



// Extract address from Google Maps link (public)
router.post('/extract-address-from-google-maps', async (req, res) => {
  try {
    const { googleMapsLink } = req.body;

    if (!googleMapsLink || typeof googleMapsLink !== 'string' || !googleMapsLink.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Google Maps link is required'
      });
    }

    const address = await extractAddressFromGoogleMapsLink(googleMapsLink.trim());

    res.json({
      success: true,
      data: {
        address: address
      }
    });
  } catch (error) {
    console.error('Extract address error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to extract address from Google Maps link',
      error: error.message
    });
  }
});

module.exports = router;

