const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class User extends BaseModel {
  constructor() {
    super(config.paths.users);
  }

  getDefaultData() {
    return {
      users: [],
      metadata: {
        version: '1.0.0'
      }
    };
  }

  async findAll() {
    await this.load();
    return this.data.users.map(user => this.sanitize(user));
  }

  async findById(id) {
    await this.load();
    const user = this.data.users.find(u => u.id === id);
    return user ? this.sanitize(user) : null;
  }

  async findByUsername(username) {
    await this.load();
    return this.data.users.find(u => u.username === username);
  }

  async create(userData) {
    await this.load();

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = {
      id: this.generateId(),
      username: userData.username,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'admin',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(user);
    await this.save();

    return this.sanitize(user);
  }

  async update(id, userData) {
    await this.load();

    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    this.data.users[index] = {
      ...this.data.users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };

    await this.save();
    return this.sanitize(this.data.users[index]);
  }

  async delete(id) {
    await this.load();

    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.data.users.splice(index, 1);
    await this.save();
    return true;
  }

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  async initializeDefaultUser() {
    await this.load();

    if (this.data.users.length === 0) {
      const defaultPassword = 'admin123';
      await this.create({
        username: 'isadora',
        password: defaultPassword,
        name: 'Isadora Carvalho',
        role: 'admin'
      });
      console.log('Usuário padrão criado: isadora / admin123');
    }
  }

  sanitize(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new User();
