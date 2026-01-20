require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const formsRoutes = require('./routes/forms');
const User = require('./models/User');
const storageService = require('./services/storageService');

const app = express();

// Middlewares
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(config.paths.uploads));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/forms', formsRoutes);

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de erros do multer
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 50MB'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Muitos arquivos. Máximo: 20 arquivos por vez'
    });
  }

  if (err.message === 'Tipo de arquivo não permitido') {
    return res.status(400).json({
      success: false,
      message: 'Tipo de arquivo não permitido. Use: JPG, PNG, WEBP, GIF ou PDF'
    });
  }

  console.error('Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Inicialização
async function init() {
  try {
    // Inicializar serviço de storage
    await storageService.init();

    // Inicializar usuário padrão
    await User.initializeDefaultUser();

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏛️  ISADORA CARVALHO - ADMIN SERVER                      ║
║                                                            ║
║   Servidor rodando em: http://localhost:${config.port}              ║
║   Admin: http://localhost:${config.port}/admin                      ║
║                                                            ║
║   Credenciais padrão:                                      ║
║   Usuário: isadora                                         ║
║   Senha: admin123                                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

init();
