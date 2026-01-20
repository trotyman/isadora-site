const { cors } = require('./_lib/cors');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
}

module.exports = cors(handler);
