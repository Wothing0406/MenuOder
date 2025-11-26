const axios = require('axios');
require('dotenv').config();

/**
 * Calculate distance between two addresses using Google Maps Distance Matrix API
 * @param {string} origin - Origin address
 * @param {string} destination - Destination address
 * @returns {Promise<{distance: number, duration: number}>} Distance in km and duration in minutes
 */
async function calculateDistance(origin, destination) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = {
      origins: origin,
      destinations: destination,
      key: apiKey,
      units: 'metric', // Use metric units (km)
      language: 'vi' // Vietnamese language
    };

    const response = await axios.get(url, { params });

    if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
      const element = response.data.rows[0].elements[0];
      const distanceInMeters = element.distance.value;
      const distanceInKm = distanceInMeters / 1000;
      const durationInSeconds = element.duration.value;
      const durationInMinutes = Math.ceil(durationInSeconds / 60);

      return {
        distance: parseFloat(distanceInKm.toFixed(2)),
        duration: durationInMinutes
      };
    } else {
      const errorStatus = response.data.rows[0]?.elements[0]?.status || response.data.status;
      throw new Error(`Google Maps API error: ${errorStatus}`);
    }
  } catch (error) {
    console.error('Error calculating distance:', error.message);
    throw error;
  }
}

/**
 * Calculate shipping fee based on distance
 * @param {number} distanceInKm - Distance in kilometers
 * @param {number} pricePerKm - Price per kilometer (default: 10000 VND)
 * @returns {number} Shipping fee in VND
 */
function calculateShippingFee(distanceInKm, pricePerKm = 10000) {
  if (!distanceInKm || distanceInKm <= 0) {
    return 0;
  }
  
  // Round up to nearest kilometer for fee calculation
  const roundedDistance = Math.ceil(distanceInKm);
  return roundedDistance * pricePerKm;
}

/**
 * Extract address from Google Maps link
 * Supports various Google Maps URL formats:
 * - https://maps.google.com/?q=lat,lng
 * - https://maps.google.com/?q=address
 * - https://goo.gl/maps/...
 * - https://www.google.com/maps/place/...
 * @param {string} googleMapsLink - Google Maps URL
 * @returns {Promise<string>} Formatted address
 */
async function extractAddressFromGoogleMapsLink(googleMapsLink) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    if (!googleMapsLink || typeof googleMapsLink !== 'string') {
      throw new Error('Invalid Google Maps link');
    }

    let placeId = null;
    let coordinates = null;
    let query = null;

    // Parse different Google Maps URL formats
    let url;
    try {
      url = new URL(googleMapsLink);
    } catch (error) {
      // If URL parsing fails, try to use it as a query directly
      query = googleMapsLink;
    }
    
    if (url) {
      // Format 1: https://www.google.com/maps/place/... (has place_id in URL)
      if (url.pathname.includes('/place/')) {
        const placeMatch = url.pathname.match(/\/place\/([^/]+)/);
        if (placeMatch) {
          // Try to extract place_id from URL params
          placeId = url.searchParams.get('cid');
          if (!placeId || !placeId.startsWith('ChIJ')) {
            // Use the place name as query
            query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          }
        }
      }

      // Format 2: https://maps.google.com/?q=lat,lng or ?q=address
      if (!placeId && !query) {
        query = url.searchParams.get('q');
        if (query) {
          // Check if it's coordinates (lat,lng)
          const coordMatch = query.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
          if (coordMatch) {
            coordinates = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
            query = null; // Clear query if we have coordinates
          }
        }
      }

      // Format 3: https://goo.gl/maps/... or https://maps.app.goo.gl/... (short URL)
      if ((url.hostname.includes('goo.gl') || url.hostname.includes('maps.app.goo.gl')) && !placeId && !coordinates && !query) {
        try {
          // Follow redirect to get actual URL
          const redirectResponse = await axios.get(googleMapsLink, { 
            maxRedirects: 5,
            validateStatus: () => true // Accept any status code
          });
          
          // Get final URL from redirect
          const finalUrl = redirectResponse.request?.res?.responseUrl || 
                          redirectResponse.request?.responseURL ||
                          redirectResponse.headers?.location;
          
          if (finalUrl && finalUrl !== googleMapsLink) {
            // Recursively call with the final URL
            return extractAddressFromGoogleMapsLink(finalUrl);
          }
        } catch (err) {
          console.error('Error following redirect:', err.message);
          // If redirect fails, try to extract from original URL
          query = url.pathname.replace(/^\/maps\//, '');
        }
      }
    }

    // Use Geocoding API to get address
    const geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    let geocodingParams = {
      key: apiKey,
      language: 'vi'
    };

    if (placeId) {
      geocodingParams.place_id = placeId;
    } else if (coordinates) {
      geocodingParams.latlng = `${coordinates.lat},${coordinates.lng}`;
    } else if (query) {
      geocodingParams.address = query;
    } else {
      throw new Error('Could not extract location information from Google Maps link');
    }

    const geocodingResponse = await axios.get(geocodingUrl, { params: geocodingParams });

    if (geocodingResponse.data.status === 'OK' && geocodingResponse.data.results.length > 0) {
      // Return formatted address (first result)
      return geocodingResponse.data.results[0].formatted_address;
    } else {
      const errorStatus = geocodingResponse.data.status;
      let errorMessage = `Geocoding API error: ${errorStatus}`;
      
      // Provide more helpful error messages
      if (errorStatus === 'REQUEST_DENIED') {
        errorMessage = `Geocoding API error: REQUEST_DENIED. Vui lòng kiểm tra:
1. Geocoding API đã được bật trong Google Cloud Console
2. API key có quyền truy cập Geocoding API
3. Billing account đã được kích hoạt
4. API key restrictions không quá chặt`;
      } else if (errorStatus === 'OVER_QUERY_LIMIT') {
        errorMessage = `Geocoding API error: OVER_QUERY_LIMIT. Bạn đã vượt quá giới hạn request. Vui lòng thử lại sau.`;
      } else if (errorStatus === 'ZERO_RESULTS') {
        errorMessage = `Không tìm thấy địa chỉ từ Google Maps link. Vui lòng kiểm tra lại link.`;
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error extracting address from Google Maps link:', error.message);
    throw error;
  }
}

module.exports = {
  calculateDistance,
  calculateShippingFee,
  extractAddressFromGoogleMapsLink
};

