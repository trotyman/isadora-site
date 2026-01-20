const fs = require('fs').promises;
const path = require('path');

/**
 * BaseModel - Camada de abstração para persistência de dados
 * Preparado para migração futura para banco de dados
 */
class BaseModel {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
  }

  async load() {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(content);
      return this.data;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.data = this.getDefaultData();
        await this.save();
        return this.data;
      }
      throw error;
    }
  }

  async save() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  getDefaultData() {
    return {};
  }

  // Métodos que serão sobrescritos quando migrar para banco de dados
  async findAll() {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }

  async update(id, data) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = BaseModel;
