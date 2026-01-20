const { getProjects } = require('../../_lib/db');
const { adminMiddleware } = require('../../_lib/auth');
const { cors } = require('../../_lib/cors');

async function handler(req, res) {
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

module.exports = cors(adminMiddleware(handler));
