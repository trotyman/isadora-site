const { cors } = require('./_lib/cors');
const { testConnection } = require('./_lib/storage');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Verificar se quer testar R2
  const { testR2 } = req.query;
  
  let r2Status = null;
  if (testR2 === 'true') {
    r2Status = await testConnection();
  }

  return res.status(200).json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString(),
    environment: {
      r2Configured: !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY),
      kvConfigured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
      jwtConfigured: !!process.env.JWT_SECRET
    },
    ...(r2Status && { r2: r2Status })
  });
}

module.exports = cors(handler);
