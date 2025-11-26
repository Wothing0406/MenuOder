const express = require('express');
const router = express.Router();
// Use OpenStreetMap (FREE) instead of Google Maps
const { extractAddressFromGoogleMapsLink } = require('../utils/openStreetMap');

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

