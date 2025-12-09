const axios = require('axios');

// Rate limiting: Nominatim allows 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second in milliseconds

/**
 * Wait if needed to respect rate limit (1 request/second)
 */
async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Format address for Vietnamese addresses (improve search accuracy)
 * @param {string} address - Raw address
 * @returns {string[]} Array of search queries (from specific to general)
 */
function formatAddressForSearch(address) {
  if (!address) return [];
  
  // Remove common Vietnamese address prefixes/suffixes
  let formatted = address.trim()
    .replace(/^Địa chỉ[:\s]*/i, '')
    .replace(/^Đường[:\s]*/i, '')
    .replace(/,\s*Việt Nam$/i, '')
    .replace(/,\s*Vietnam$/i, '')
    .replace(/,\s*VN$/i, '')
    .trim();
  
  const queries = [];
  
  // Extract parts
  const parts = formatted.split(',').map(p => p.trim()).filter(p => p);
  
  if (parts.length === 0) return [formatted + ', Việt Nam'];
  
  // Try 1: Full address with Vietnam
  queries.push(formatted + ', Việt Nam');
  
  // Try 2: Without house number (if first part is a number)
  if (parts.length > 1 && /^\d+/.test(parts[0])) {
    const withoutNumber = parts.slice(1).join(', ') + ', Việt Nam';
    if (!queries.includes(withoutNumber)) {
      queries.push(withoutNumber);
    }
  }
  
  // Try 3: Street name + Ward + City + Province (skip house number)
  if (parts.length >= 4) {
    const streetWardCityProvince = parts.slice(1).join(', ') + ', Việt Nam';
    if (!queries.includes(streetWardCityProvince)) {
      queries.push(streetWardCityProvince);
    }
  }
  
  // Try 4: Ward + City + Province
  if (parts.length >= 3) {
    const wardCityProvince = parts.slice(-3).join(', ') + ', Việt Nam';
    if (!queries.includes(wardCityProvince)) {
      queries.push(wardCityProvince);
    }
  }
  
  // Try 5: City + Province
  if (parts.length >= 2) {
    const cityProvince = parts.slice(-2).join(', ') + ', Việt Nam';
    if (!queries.includes(cityProvince)) {
      queries.push(cityProvince);
    }
    
    // Also try with "Thành phố" prefix
    const lastPart = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];
    if (lastPart && secondLast) {
      const cityProvinceFormatted = `Thành phố ${secondLast}, Tỉnh ${lastPart}, Việt Nam`;
      if (!queries.includes(cityProvinceFormatted)) {
        queries.push(cityProvinceFormatted);
      }
    }
  }
  
  // Try 6: Just city/town name
  if (parts.length >= 1) {
    const city = parts[parts.length - 1] + ', Việt Nam';
    if (!queries.includes(city)) {
      queries.push(city);
    }
    
    // Also try with "Thành phố" prefix
    const cityFormatted = `Thành phố ${parts[parts.length - 1]}, Việt Nam`;
    if (!queries.includes(cityFormatted)) {
      queries.push(cityFormatted);
    }
  }
  
  // Try 7: Original without modifications
  if (!queries.includes(formatted)) {
    queries.push(formatted);
  }
  
  return queries;
}

/**
 * Calculate similarity between two strings (simple word matching)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const words1 = str1.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
}

/**
 * Format address result for Vietnamese display
 * @param {object} result - Nominatim result
 * @returns {string} Formatted address
 */
function formatVietnameseAddress(result) {
  if (!result) return '';
  
  // Try to build address from components (more accurate)
  const addr = result.address || {};
  let parts = [];
  
  // Build address in Vietnamese format: Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP
  if (addr.house_number) parts.push(addr.house_number);
  if (addr.road) parts.push(addr.road);
  if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
  if (addr.quarter || addr.city_district) parts.push(addr.quarter || addr.city_district);
  if (addr.city || addr.town || addr.village) {
    const cityName = addr.city || addr.town || addr.village;
    // Add proper Vietnamese prefix
    if (cityName && !cityName.includes('Thành phố') && !cityName.includes('Thị xã') && !cityName.includes('Huyện')) {
      if (addr.city) parts.push(`Thành phố ${cityName}`);
      else if (addr.town) parts.push(`Thị xã ${cityName}`);
      else parts.push(cityName);
    } else {
      parts.push(cityName);
    }
  }
  if (addr.state || addr.region) {
    const stateName = addr.state || addr.region;
    if (stateName && !stateName.includes('Tỉnh')) {
      parts.push(`Tỉnh ${stateName}`);
    } else {
      parts.push(stateName);
    }
  }
  if (addr.country) {
    parts.push(addr.country === 'Việt Nam' || addr.country === 'Vietnam' ? 'Việt Nam' : addr.country);
  }
  
  // If we have parts, join them; otherwise use display_name
  if (parts.length > 0) {
    return parts.filter(p => p).join(', ');
  }
  
  // Fallback to display_name
  return result.display_name || '';
}

/**
 * Geocode address using OpenStreetMap Nominatim API (FREE, no API key needed)
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number, formatted_address: string}>}
 */
async function geocodeAddress(address) {
  try {
    if (!address || typeof address !== 'string' || !address.trim()) {
      throw new Error('Address is required');
    }

    // Wait to respect rate limit
    await waitForRateLimit();

    // Get multiple search queries (from specific to general)
    const searchQueries = formatAddressForSearch(address);

    // Nominatim API - completely free, no API key needed
    const url = 'https://nominatim.openstreetmap.org/search';
    
    // Try each query variation until we find a result
    for (let i = 0; i < searchQueries.length; i++) {
      const searchQuery = searchQueries[i];
      
      let params = {
        q: searchQuery,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        'accept-language': 'vi',
        countrycodes: 'vn', // Limit to Vietnam
        bounded: 1
      };

      try {
        await waitForRateLimit();
        
        const response = await axios.get(url, {
          params,
          headers: {
            'User-Agent': 'MenuOrder-App/1.0'
          }
        });

        if (response.data && response.data.length > 0) {
          // Find the best matching result by comparing with original address
          let bestResult = response.data[0];
          let bestSimilarity = 0;
          
          // If this is the first query (most specific), try to find best match
          if (i === 0) {
            const originalLower = address.toLowerCase();
            response.data.forEach(result => {
              const resultAddress = formatVietnameseAddress(result) || result.display_name || '';
              const similarity = calculateSimilarity(originalLower, resultAddress.toLowerCase());
              
              // Also check if street name matches
              const originalStreet = originalLower.match(/(?:số\s*)?\d+[a-z]?\s*([^,]+)/i)?.[1]?.trim();
              const resultStreet = resultAddress.toLowerCase().match(/(?:số\s*)?\d+[a-z]?\s*([^,]+)/i)?.[1]?.trim() ||
                                  result.address?.road?.toLowerCase();
              
              let streetMatch = 0;
              if (originalStreet && resultStreet) {
                streetMatch = calculateSimilarity(originalStreet, resultStreet);
              }
              
              // Weighted score: 70% overall similarity, 30% street name match
              const totalScore = (similarity * 0.7) + (streetMatch * 0.3);
              
              if (totalScore > bestSimilarity) {
                bestSimilarity = totalScore;
                bestResult = result;
              }
            });
            
            console.log(`Found address using query "${searchQuery}" with similarity: ${(bestSimilarity * 100).toFixed(1)}%`);
          } else {
            bestResult = response.data[0];
          }
          
          const formattedAddress = formatVietnameseAddress(bestResult);
          
          return {
            lat: parseFloat(bestResult.lat),
            lng: parseFloat(bestResult.lon),
            formatted_address: formattedAddress || bestResult.display_name,
            raw_result: bestResult, // Include raw result for house number checking
            similarity: bestSimilarity || calculateSimilarity(address.toLowerCase(), (formattedAddress || bestResult.display_name || '').toLowerCase())
          };
        }
      } catch (err) {
        console.error(`Error with query "${searchQuery}":`, err.message);
        // Continue to next query
      }
      
      // If no results with country restriction, try without it
      if (i === 0) { // Only try once for the first query
        delete params.countrycodes;
        delete params.bounded;
        
        try {
          await waitForRateLimit();
          
          const retryResponse = await axios.get(url, {
            params,
            headers: {
              'User-Agent': 'MenuOrder-App/1.0'
            }
          });
          
          if (retryResponse.data && retryResponse.data.length > 0) {
            // Find best match
            let bestResult = retryResponse.data[0];
            let bestSimilarity = 0;
            
            const originalLower = address.toLowerCase();
            retryResponse.data.forEach(result => {
              const resultAddress = formatVietnameseAddress(result) || result.display_name || '';
              const similarity = calculateSimilarity(originalLower, resultAddress.toLowerCase());
              
              if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestResult = result;
              }
            });
            
            const formattedAddress = formatVietnameseAddress(bestResult);
            
            console.log(`Found address (without country restriction) using query "${searchQuery}" with similarity: ${(bestSimilarity * 100).toFixed(1)}%`);
            
            return {
              lat: parseFloat(bestResult.lat),
              lng: parseFloat(bestResult.lon),
              formatted_address: formattedAddress || bestResult.display_name,
              raw_result: bestResult,
              similarity: bestSimilarity
            };
          }
        } catch (err) {
          // Continue to next query
        }
      }
    }
    
    // If all queries failed, try one more time with just city name as fallback
    const parts = address.split(',').map(p => p.trim()).filter(p => p);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].replace(/,\s*Việt Nam$/i, '').trim();
      if (lastPart && lastPart !== address) {
        try {
          await waitForRateLimit();
          
          const finalParams = {
            q: `${lastPart}, Việt Nam`,
            format: 'json',
            addressdetails: 1,
            limit: 1,
            'accept-language': 'vi',
            countrycodes: 'vn'
          };
          
          const finalResponse = await axios.get(url, {
            params: finalParams,
            headers: {
              'User-Agent': 'MenuOrder-App/1.0'
            }
          });
          
          if (finalResponse.data && finalResponse.data.length > 0) {
            const result = finalResponse.data[0];
            const formattedAddress = formatVietnameseAddress(result);
            
            console.log(`Found approximate address (city only): "${lastPart}"`);
            
            return {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
              formatted_address: formattedAddress || result.display_name,
              raw_result: result // Include raw result for house number checking
            };
          }
        } catch (err) {
          // Continue to throw error
        }
      }
    }
    
    // If all queries failed, throw error with helpful message
    console.warn(`Could not geocode address: "${address}"`);
    throw new Error(`Không tìm thấy địa chỉ: "${address}". Vui lòng thử nhập địa chỉ theo định dạng: "Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Thành phố, Tỉnh" hoặc "Tên đường, Phường/Xã, Thành phố, Tỉnh". Ví dụ: "123 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh" hoặc "Hội An, Quảng Nam".`);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    console.error('Error details:', {
      code: error.code,
      response: error.response?.status,
      address: address
    });
    
    // Preserve original error message if it's already user-friendly
    if (error.message.includes('Không tìm thấy')) {
      throw error;
    }
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Không thể kết nối đến dịch vụ xác thực địa chỉ. Vui lòng kiểm tra kết nối internet và thử lại.');
    }
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      throw new Error('Yêu cầu xác thực địa chỉ quá thời gian. Vui lòng thử lại sau.');
    }
    
    if (error.response?.status === 429 || error.message.includes('rate limit')) {
      throw new Error('Quá nhiều yêu cầu xác thực địa chỉ. Vui lòng đợi một chút rồi thử lại.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Dịch vụ xác thực địa chỉ đang gặp sự cố. Vui lòng thử lại sau.');
    }
    
    // Generic error
    throw new Error(`Lỗi khi tìm địa chỉ: ${error.message}. Vui lòng thử lại hoặc nhập địa chỉ theo định dạng: "Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Thành phố, Tỉnh".`);
  }
}

/**
 * Reverse geocode coordinates to address using Nominatim
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address
 */
async function reverseGeocode(lat, lng) {
  try {
    // Wait to respect rate limit
    await waitForRateLimit();

    const url = 'https://nominatim.openstreetmap.org/reverse';
    const params = {
      lat: lat,
      lon: lng,
      format: 'json',
      addressdetails: 1,
      'accept-language': 'vi',
      zoom: 18 // Higher zoom for more detailed address
    };

    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'MenuOrder-App/1.0'
      }
    });

    if (response.data) {
      // Use formatted address function for consistent Vietnamese format
      const formattedAddress = formatVietnameseAddress(response.data);
      return formattedAddress || response.data.display_name || 'Không thể lấy địa chỉ từ tọa độ';
    } else {
      throw new Error('Could not get address from coordinates');
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    throw new Error(`Không thể lấy địa chỉ từ tọa độ: ${error.message}`);
  }
}

/**
 * Calculate distance and duration between two addresses using OSRM (FREE)
 * @param {string} origin - Origin address
 * @param {string} destination - Destination address
 * @returns {Promise<{distance: number, duration: number}>} Distance in km and duration in minutes
 */
async function calculateDistance(origin, destination) {
  try {
    if (!origin || !destination) {
      throw new Error('Origin and destination addresses are required');
    }

    // First, geocode both addresses to get coordinates
    // Don't use Promise.all to respect rate limit (1 req/second)
    let originCoords, destCoords;
    
    try {
      originCoords = await geocodeAddress(origin);
    } catch (error) {
      throw new Error(`Không tìm thấy địa chỉ xuất phát: "${origin}". ${error.message}`);
    }
    
    // Wait 1 second before next request (rate limit)
    await waitForRateLimit();
    
    try {
      destCoords = await geocodeAddress(destination);
    } catch (error) {
      throw new Error(`Không tìm thấy địa chỉ đến: "${destination}". ${error.message}`);
    }

    // Use OSRM (Open Source Routing Machine) to calculate route
    // Public instance: http://router.project-osrm.org
    const osrmUrl = 'http://router.project-osrm.org/route/v1/driving';
    const coords = `${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`;
    
    const response = await axios.get(`${osrmUrl}/${coords}`, {
      params: {
        overview: 'false',
        alternatives: false,
        steps: false
      }
    });

    if (response.data && response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distanceInMeters = route.distance;
      const distanceInKm = distanceInMeters / 1000;
      const durationInSeconds = route.duration;
      const durationInMinutes = Math.ceil(durationInSeconds / 60);

      return {
        distance: parseFloat(distanceInKm.toFixed(2)),
        duration: durationInMinutes
      };
    } else {
      throw new Error('Could not calculate route');
    }
  } catch (error) {
    console.error('Distance calculation error:', error.message);
    throw error;
  }
}

/**
 * Extract address from Google Maps link using Nominatim
 * Supports various Google Maps URL formats
 * @param {string} googleMapsLink - Google Maps URL
 * @returns {Promise<string>} Formatted address
 */
async function extractAddressFromGoogleMapsLink(googleMapsLink) {
  try {
    if (!googleMapsLink || typeof googleMapsLink !== 'string') {
      throw new Error('Invalid Google Maps link');
    }

    let coordinates = null;
    let query = null;
    let url = null;

    // Handle short links first (maps.app.goo.gl, goo.gl/maps)
    if (googleMapsLink.includes('goo.gl') || googleMapsLink.includes('maps.app.goo.gl')) {
      try {
        console.log('Detected short link, following redirect...');
        // Follow redirect to get actual URL
        // Use GET request to get the full redirect chain
        const redirectResponse = await axios.get(googleMapsLink, {
          maxRedirects: 5,
          validateStatus: () => true,
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        // Get final URL from redirect
        let finalUrl = redirectResponse.request?.res?.responseUrl || 
                      redirectResponse.request?.responseURL ||
                      redirectResponse.request?.redirects?.[redirectResponse.request.redirects.length - 1]?.url ||
                      redirectResponse.headers?.location;
        
        // If we got a location header, it might be relative, make it absolute
        if (finalUrl && !finalUrl.startsWith('http')) {
          try {
            finalUrl = new URL(finalUrl, googleMapsLink).href;
          } catch (e) {
            // If URL construction fails, continue with original link
          }
        }
        
        if (finalUrl && finalUrl !== googleMapsLink && finalUrl.includes('google.com')) {
          console.log('Redirected to:', finalUrl);
          // Recursively call with the final URL
          return extractAddressFromGoogleMapsLink(finalUrl);
        }
      } catch (redirectError) {
        console.error('Error following redirect:', redirectError.message);
        // Continue with original link parsing - maybe it's not a redirect
      }
    }

    // Parse Google Maps URL to extract coordinates or query
    try {
      url = new URL(googleMapsLink);
    } catch (urlError) {
      // If URL parsing fails, try to extract manually
      console.log('URL parsing failed, trying manual extraction');
    }

    if (url) {
      // Format 1: https://maps.google.com/?q=lat,lng or ?q=address
      const qParam = url.searchParams.get('q');
      if (qParam) {
        // Check if it's coordinates (lat,lng)
        const coordMatch = qParam.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
        if (coordMatch) {
          coordinates = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        } else {
          // It's an address query
          query = decodeURIComponent(qParam);
        }
      }

      // Format 2: https://www.google.com/maps/place/...
      if (!coordinates && !query && url.pathname.includes('/place/')) {
        const placeMatch = url.pathname.match(/\/place\/([^/@]+)/);
        if (placeMatch) {
          query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        }
        
        // Also check for coordinates in the URL path (e.g., /@lat,lng)
        const coordMatchInPath = url.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatchInPath) {
          coordinates = { 
            lat: parseFloat(coordMatchInPath[1]), 
            lng: parseFloat(coordMatchInPath[2]) 
          };
        }
      }

      // Format 3: https://www.google.com/maps/@lat,lng
      if (!coordinates && !query) {
        const coordMatchInPath = url.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatchInPath) {
          coordinates = { 
            lat: parseFloat(coordMatchInPath[1]), 
            lng: parseFloat(coordMatchInPath[2]) 
          };
        }
      }

      // Format 4: Check for ll parameter (lat,lng)
      const llParam = url.searchParams.get('ll');
      if (llParam && !coordinates) {
        const coordMatch = llParam.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
        if (coordMatch) {
          coordinates = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        }
      }

      // Format 5: Check for center parameter
      const centerParam = url.searchParams.get('center');
      if (centerParam && !coordinates) {
        const coordMatch = centerParam.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
        if (coordMatch) {
          coordinates = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
        }
      }
    }

    // If still no coordinates or query, try to extract from the raw link
    if (!coordinates && !query) {
      // Try to find coordinates in the link string
      const coordMatch = googleMapsLink.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        coordinates = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
      } else {
        // Last resort: use the link itself as query (might work for some formats)
        // Extract domain and path, remove common Google Maps patterns
        let cleanedLink = googleMapsLink
          .replace(/https?:\/\/(www\.)?(maps\.)?google\.(com|co\.vn)\/?/g, '')
          .replace(/\/maps\/?/g, '')
          .replace(/place\//g, '')
          .replace(/@[^/]+/g, '')
          .replace(/[?&].*$/, '')
          .trim();
        
        if (cleanedLink && cleanedLink.length > 3) {
          query = decodeURIComponent(cleanedLink.replace(/\+/g, ' '));
        }
      }
    }

    // If we have coordinates, use reverse geocoding
    if (coordinates) {
      console.log('Using coordinates for reverse geocoding:', coordinates);
      return await reverseGeocode(coordinates.lat, coordinates.lng);
    }
    
    // If we have query, use forward geocoding
    if (query) {
      console.log('Using query for geocoding:', query);
      const result = await geocodeAddress(query);
      return result.formatted_address;
    }

    // If nothing works, throw a more helpful error
    throw new Error(`Could not extract location information from Google Maps link: ${googleMapsLink}. Vui lòng thử nhập địa chỉ trực tiếp hoặc sử dụng link Google Maps có định dạng: https://maps.google.com/?q=địa+chỉ hoặc https://www.google.com/maps/place/địa+chỉ`);
  } catch (error) {
    console.error('Error extracting address from Google Maps link:', error.message);
    throw error;
  }
}

/**
 * Calculate shipping fee with business rules:
 * - <= 1km: free
 * - > 15km: out of range
 * - 1–15km: distance * pricePerKm (rounded up)
 *
 * @param {number} distanceInKm - Distance in kilometers
 * @param {number} pricePerKm - Price per kilometer (default: 10000 VND)
 * @returns {{distance: number, shippingFee: number, status: 'ok'|'error', message: string}}
 */
function calculateShippingFee(distanceInKm, pricePerKm = 10000) {
  const normalizedDistance = Number(distanceInKm);

  if (Number.isNaN(normalizedDistance) || normalizedDistance < 0) {
    return {
      distance: normalizedDistance,
      shippingFee: 0,
      status: 'error',
      message: 'Khoảng cách không hợp lệ'
    };
  }

  if (normalizedDistance <= 1) {
    return {
      distance: normalizedDistance,
      shippingFee: 0,
      status: 'ok',
      message: 'Miễn phí vận chuyển trong phạm vi 1km'
    };
  }

  if (normalizedDistance > 15) {
    return {
      distance: normalizedDistance,
      shippingFee: 0,
      status: 'error',
      message: 'Ngoài phạm vi giao hàng'
    };
  }

  const roundedDistance = Math.ceil(normalizedDistance);
  const shippingFee = roundedDistance * pricePerKm;

  return {
    distance: normalizedDistance,
    shippingFee,
    status: 'ok',
    message: 'Phí giao hàng tạm tính'
  };
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  calculateShippingFee,
  extractAddressFromGoogleMapsLink
};

