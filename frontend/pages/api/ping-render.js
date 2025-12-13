/**
 * API route để ping Render backend (dùng với Vercel Cron Jobs)
 * Giúp giữ backend Render luôn hoạt động
 * 
 * Setup trong vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/ping-render",
 *     "schedule": "*\/5 * * * *"
 *   }]
 * }
 */

export default async function handler(req, res) {
  // Lấy backend URL từ environment variable hoặc dùng default
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://menuoder-backend.onrender.com';
  
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Pinging Render backend: ${backendUrl}/ping`);
    
    const response = await fetch(`${backendUrl}/ping`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron/1.0'
      },
      // Timeout sau 10 giây
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`[${new Date().toISOString()}] Ping successful:`, data);

    return res.status(200).json({
      success: true,
      message: 'Pinged Render backend successfully',
      timestamp: new Date().toISOString(),
      backendUrl,
      data
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to ping Render backend',
      error: error.message,
      timestamp: new Date().toISOString(),
      backendUrl
    });
  }
}


 * Giúp giữ backend Render luôn hoạt động
 * 
 * Setup trong vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/ping-render",
 *     "schedule": "*\/5 * * * *"
 *   }]
 * }
 */

export default async function handler(req, res) {
  // Lấy backend URL từ environment variable hoặc dùng default
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://menuoder-backend.onrender.com';
  
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Pinging Render backend: ${backendUrl}/ping`);
    
    const response = await fetch(`${backendUrl}/ping`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron/1.0'
      },
      // Timeout sau 10 giây
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`[${new Date().toISOString()}] Ping successful:`, data);

    return res.status(200).json({
      success: true,
      message: 'Pinged Render backend successfully',
      timestamp: new Date().toISOString(),
      backendUrl,
      data
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Ping failed:`, error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to ping Render backend',
      error: error.message,
      timestamp: new Date().toISOString(),
      backendUrl
    });
  }
}

