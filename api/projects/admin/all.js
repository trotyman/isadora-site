const { getProjects } = require('../../_lib/db');
const { adminMiddleware } = require('../../_lib/auth');
const { cors } = require('../../_lib/cors');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { status, category, sortBy, order } = req.query;
    let projects = await getProjects();

    // Filtros
    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    if (category) {
      projects = projects.filter(p => p.category === category);
    }

    // Ordenação
    if (sortBy) {
      const orderMultiplier = order === 'asc' ? 1 : -1;
      projects.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1 * orderMultiplier;
        if (a[sortBy] > b[sortBy]) return 1 * orderMultiplier;
        return 0;
      });
    } else {
      // Por padrão, ordena por data de criação (mais recente primeiro)
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

module.exports = cors(adminMiddleware(handler));
