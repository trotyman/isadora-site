const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

class StorageService {
  constructor() {
    this.uploadsPath = config.paths.uploads;
  }

  async init() {
    await fs.mkdir(this.uploadsPath, { recursive: true });
  }

  getProjectPath(projectId) {
    return path.join(this.uploadsPath, 'projects', projectId);
  }

  async ensureProjectDir(projectId) {
    const projectPath = this.getProjectPath(projectId);
    await fs.mkdir(projectPath, { recursive: true });
    return projectPath;
  }

  async saveFile(projectId, file) {
    const projectPath = await this.ensureProjectDir(projectId);

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const filePath = path.join(projectPath, filename);

    await fs.writeFile(filePath, file.buffer);

    const type = this.getFileType(file.mimetype);

    return {
      filename,
      originalName: file.originalname,
      type,
      mimeType: file.mimetype,
      size: file.size,
      path: path.relative(config.paths.data, filePath).replace(/\\/g, '/')
    };
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.join(config.paths.data, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return true; // Arquivo já não existe
      }
      throw error;
    }
  }

  async deleteProjectFiles(projectId) {
    try {
      const projectPath = this.getProjectPath(projectId);
      await fs.rm(projectPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return true;
      }
      throw error;
    }
  }

  getFileType(mimeType) {
    if (config.upload.allowedImageTypes.includes(mimeType)) {
      return 'image';
    }
    if (config.upload.allowedDocTypes.includes(mimeType)) {
      return 'document';
    }
    return 'unknown';
  }

  isAllowedType(mimeType) {
    return (
      config.upload.allowedImageTypes.includes(mimeType) ||
      config.upload.allowedDocTypes.includes(mimeType)
    );
  }

  async getFileStream(filePath) {
    const fullPath = path.join(config.paths.data, filePath);
    const content = await fs.readFile(fullPath);
    return content;
  }

  async getFileStats(filePath) {
    const fullPath = path.join(config.paths.data, filePath);
    return fs.stat(fullPath);
  }
}

module.exports = new StorageService();
