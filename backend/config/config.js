const path = require('path');

module.exports = {
  // Server config
  port: process.env.PORT || 3000,

  // JWT config
  jwt: {
    secret: process.env.JWT_SECRET || 'isadora-arq-secret-key-change-in-production',
    expiresIn: '24h'
  },

  // Paths
  paths: {
    data: path.join(__dirname, '../../data'),
    uploads: path.join(__dirname, '../../data/uploads'),
    projects: path.join(__dirname, '../../data/projects.json'),
    users: path.join(__dirname, '../../data/users.json')
  },

  // Upload config
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocTypes: ['application/pdf'],
    maxFilesPerProject: 20
  },

  // CORS config
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
