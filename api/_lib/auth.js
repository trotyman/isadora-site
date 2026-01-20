const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'isadora-arq-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

function authMiddleware(handler) {
  return async (req, res) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    req.user = decoded;
    return handler(req, res);
  };
}

function adminMiddleware(handler) {
  return authMiddleware(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado'
      });
    }
    return handler(req, res);
  });
}

module.exports = {
  JWT_SECRET,
  createToken,
  verifyToken,
  getTokenFromRequest,
  authMiddleware,
  adminMiddleware
};
