const { getUsers } = require('../_lib/db');
const { authMiddleware } = require('../_lib/auth');
const { cors } = require('../_lib/cors');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const users = await getUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const { password: _, ...sanitizedUser } = user;

    return res.status(200).json({
      success: true,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = cors(authMiddleware(handler));
