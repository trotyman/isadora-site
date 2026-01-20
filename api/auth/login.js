const bcrypt = require('bcryptjs');
const { getUsers, setUsers, generateId } = require('../_lib/db');
const { createToken } = require('../_lib/auth');
const { cors } = require('../_lib/cors');

async function initializeDefaultUser(users) {
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultUser = {
      id: generateId(),
      username: 'isadora',
      password: hashedPassword,
      name: 'Isadora Carvalho',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(defaultUser);
    await setUsers(users);
    console.log('Usuário padrão criado: isadora / admin123');
  }
  return users;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuário e senha são obrigatórios'
      });
    }

    let users = await getUsers();
    users = await initializeDefaultUser(users);

    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário ou senha inválidos'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Usuário ou senha inválidos'
      });
    }

    const token = createToken(user);

    const { password: _, ...sanitizedUser } = user;

    return res.status(200).json({
      success: true,
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = cors(handler);
