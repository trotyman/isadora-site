const bcrypt = require('bcryptjs');
const { getUsers, setUsers, generateId } = require('../_lib/db');
const { createToken, authMiddleware } = require('../_lib/auth');
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
  }
  return users;
}

// POST /api/auth/login
async function handleLogin(req, res) {
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

// GET /api/auth/me
async function handleMe(req, res) {
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

// PUT /api/auth/password
async function handlePassword(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.username === req.user.username);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const user = users[userIndex];
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    await setUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/auth/init - Inicializa o usuário admin
async function handleInit(req, res) {
  try {
    let users = await getUsers();
    
    if (users.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Usuário admin já existe',
        username: 'isadora'
      });
    }

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

    return res.status(201).json({
      success: true,
      message: 'Usuário admin criado com sucesso!',
      username: 'isadora',
      defaultPassword: 'admin123',
      note: 'IMPORTANTE: Troque a senha após o primeiro login!'
    });
  } catch (error) {
    console.error('Erro ao inicializar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao inicializar: ' + error.message
    });
  }
}

async function handler(req, res) {
  const { path } = req.query;
  const route = Array.isArray(path) ? path[0] : path;

  switch (route) {
    case 'login':
      return handleLogin(req, res);
    case 'me':
      return authMiddleware(handleMe)(req, res);
    case 'password':
      return authMiddleware(handlePassword)(req, res);
    case 'init':
      return handleInit(req, res);
    default:
      return res.status(404).json({ success: false, message: 'Rota não encontrada' });
  }
}

module.exports = cors(handler);
