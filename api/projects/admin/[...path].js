const { getProjects, setProjects } = require('../../_lib/db');
const { adminMiddleware } = require('../../_lib/auth');
const { cors } = require('../../_lib/cors');

// GET /api/projects/admin/all
async function handleAll(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { status, category, sortBy, order } = req.query;
    let projects = await getProjects();

    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    if (category) {
      projects = projects.filter(p => p.category === category);
    }

    if (sortBy) {
      const orderMultiplier = order === 'asc' ? 1 : -1;
      projects.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1 * orderMultiplier;
        if (a[sortBy] > b[sortBy]) return 1 * orderMultiplier;
        return 0;
      });
    } else {
      projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// GET /api/projects/admin/stats
async function handleStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const projects = await getProjects();

    const stats = {
      total: projects.length,
      published: projects.filter(p => p.status === 'published').length,
      draft: projects.filter(p => p.status === 'draft').length,
      archived: projects.filter(p => p.status === 'archived').length,
      featured: projects.filter(p => p.featured).length
    };

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// PUT /api/projects/admin/order
async function handleOrder(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        message: 'Ordem inválida'
      });
    }

    const projects = await getProjects();

    order.forEach((item, index) => {
      const project = projects.find(p => p.id === item.id);
      if (project) {
        project.order = index;
      }
    });

    projects.sort((a, b) => a.order - b.order);
    await setProjects(projects);

    return res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erro ao reordenar projetos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

async function handler(req, res) {
  const { path } = req.query;
  const route = Array.isArray(path) ? path[0] : path;

  switch (route) {
    case 'all':
      return handleAll(req, res);
    case 'stats':
      return handleStats(req, res);
    case 'order':
      return handleOrder(req, res);
    default:
      return res.status(404).json({ success: false, message: 'Rota não encontrada' });
  }
}

module.exports = cors(adminMiddleware(handler));
