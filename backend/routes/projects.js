const express = require('express');
const multer = require('multer');
const router = express.Router();
const Project = require('../models/Project');
const storageService = require('../services/storageService');
const config = require('../config/config');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFilesPerProject
  },
  fileFilter: (req, file, cb) => {
    if (storageService.isAllowedType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});

// ========== ROTAS PÚBLICAS ==========

// GET /api/projects - Lista projetos publicados (público)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;

    const filters = {
      status: 'published'
    };

    if (category) filters.category = category;
    if (featured === 'true') filters.featured = true;

    const projects = await Project.findAll(filters);

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/projects/categories - Lista categorias
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.getCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/projects/:id - Detalhes de um projeto
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Se não estiver autenticado, só mostra projetos publicados
    if (!req.headers.authorization && project.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTAS ADMIN ==========

// GET /api/projects/admin/all - Lista todos os projetos (admin)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, category, sortBy, order } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (sortBy) filters.sortBy = sortBy;
    if (order) filters.order = order;

    const projects = await Project.findAll(filters);

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/projects/admin/stats - Estatísticas (admin)
router.get('/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Project.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/projects - Criar projeto (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const projectData = req.body;
    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/projects/:id - Atualizar projeto (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.update(req.params.id, req.body);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/projects/:id - Excluir projeto (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Excluir arquivos do projeto
    await storageService.deleteProjectFiles(req.params.id);

    // Excluir projeto do banco
    await Project.delete(req.params.id);

    res.json({
      success: true,
      message: 'Projeto excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/projects/:id/files - Upload de arquivos (admin)
router.post('/:id/files', authMiddleware, adminMiddleware, upload.array('files', 20), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const savedFile = await storageService.saveFile(req.params.id, file);
      const fileRecord = await Project.addFile(req.params.id, savedFile);
      uploadedFiles.push(fileRecord);
    }

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// DELETE /api/projects/:id/files/:fileId - Excluir arquivo (admin)
router.delete('/:id/files/:fileId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const file = await Project.removeFile(req.params.id, req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    await storageService.deleteFile(file.path);

    res.json({
      success: true,
      message: 'Arquivo excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/projects/:id/cover/:fileId - Definir capa (admin)
router.put('/:id/cover/:fileId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.setCoverImage(req.params.id, req.params.fileId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto ou arquivo não encontrado'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao definir capa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/projects/admin/order - Reordenar projetos (admin)
router.put('/admin/order', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        message: 'Ordem inválida'
      });
    }

    const projects = await Project.updateOrder(order);

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erro ao reordenar projetos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
