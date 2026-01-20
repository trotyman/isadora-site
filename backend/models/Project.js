const BaseModel = require('./BaseModel');
const config = require('../config/config');

class Project extends BaseModel {
  constructor() {
    super(config.paths.projects);
  }

  getDefaultData() {
    return {
      projects: [],
      metadata: {
        version: '1.0.0',
        lastUpdated: null,
        totalProjects: 0
      }
    };
  }

  async findAll(filters = {}) {
    await this.load();

    let projects = [...this.data.projects];

    // Filtros
    if (filters.status) {
      projects = projects.filter(p => p.status === filters.status);
    }

    if (filters.category) {
      projects = projects.filter(p => p.category === filters.category);
    }

    if (filters.featured !== undefined) {
      projects = projects.filter(p => p.featured === filters.featured);
    }

    // Ordenação
    if (filters.sortBy) {
      const order = filters.order === 'asc' ? 1 : -1;
      projects.sort((a, b) => {
        if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
        if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
        return 0;
      });
    } else {
      // Por padrão, ordena por data de criação (mais recente primeiro)
      projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return projects;
  }

  async findById(id) {
    await this.load();
    return this.data.projects.find(p => p.id === id) || null;
  }

  async findBySlug(slug) {
    await this.load();
    return this.data.projects.find(p => p.slug === slug) || null;
  }

  async create(projectData) {
    await this.load();

    const project = {
      id: this.generateId(),
      title: projectData.title,
      slug: this.generateSlug(projectData.title),
      description: projectData.description || '',
      fullDescription: projectData.fullDescription || '',
      category: projectData.category || 'residencial',
      location: projectData.location || '',
      area: projectData.area || '',
      year: projectData.year || new Date().getFullYear(),
      client: projectData.client || '',
      status: projectData.status || 'draft', // draft, published, archived
      featured: projectData.featured || false,
      coverImage: projectData.coverImage || null,
      files: projectData.files || [], // { id, filename, originalName, type, mimeType, size, path, uploadedAt }
      tags: projectData.tags || [],
      order: this.data.projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.projects.push(project);
    this.data.metadata.totalProjects = this.data.projects.length;
    this.data.metadata.lastUpdated = new Date().toISOString();

    await this.save();
    return project;
  }

  async update(id, projectData) {
    await this.load();

    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    // Se o título mudou, atualiza o slug
    if (projectData.title && projectData.title !== this.data.projects[index].title) {
      projectData.slug = this.generateSlug(projectData.title);
    }

    this.data.projects[index] = {
      ...this.data.projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    this.data.metadata.lastUpdated = new Date().toISOString();

    await this.save();
    return this.data.projects[index];
  }

  async delete(id) {
    await this.load();

    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.data.projects.splice(index, 1);
    this.data.metadata.totalProjects = this.data.projects.length;
    this.data.metadata.lastUpdated = new Date().toISOString();

    await this.save();
    return true;
  }

  async addFile(projectId, fileData) {
    await this.load();

    const project = this.data.projects.find(p => p.id === projectId);
    if (!project) return null;

    const file = {
      id: this.generateId(),
      filename: fileData.filename,
      originalName: fileData.originalName,
      type: fileData.type, // 'image' ou 'document'
      mimeType: fileData.mimeType,
      size: fileData.size,
      path: fileData.path,
      uploadedAt: new Date().toISOString()
    };

    project.files.push(file);
    project.updatedAt = new Date().toISOString();

    await this.save();
    return file;
  }

  async removeFile(projectId, fileId) {
    await this.load();

    const project = this.data.projects.find(p => p.id === projectId);
    if (!project) return false;

    const fileIndex = project.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return false;

    const file = project.files[fileIndex];
    project.files.splice(fileIndex, 1);
    project.updatedAt = new Date().toISOString();

    await this.save();
    return file;
  }

  async setCoverImage(projectId, fileId) {
    await this.load();

    const project = this.data.projects.find(p => p.id === projectId);
    if (!project) return null;

    const file = project.files.find(f => f.id === fileId);
    if (!file || file.type !== 'image') return null;

    project.coverImage = fileId;
    project.updatedAt = new Date().toISOString();

    await this.save();
    return project;
  }

  async updateOrder(projectsOrder) {
    await this.load();

    projectsOrder.forEach((item, index) => {
      const project = this.data.projects.find(p => p.id === item.id);
      if (project) {
        project.order = index;
      }
    });

    this.data.projects.sort((a, b) => a.order - b.order);
    await this.save();
    return this.data.projects;
  }

  async getCategories() {
    await this.load();
    const categories = [...new Set(this.data.projects.map(p => p.category))];
    return categories;
  }

  async getStats() {
    await this.load();

    return {
      total: this.data.projects.length,
      published: this.data.projects.filter(p => p.status === 'published').length,
      draft: this.data.projects.filter(p => p.status === 'draft').length,
      archived: this.data.projects.filter(p => p.status === 'archived').length,
      featured: this.data.projects.filter(p => p.featured).length
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

module.exports = new Project();
