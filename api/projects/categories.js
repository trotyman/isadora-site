const { getProjects } = require('../_lib/db');
const { cors } = require('../_lib/cors');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const projects = await getProjects();
    const categories = [...new Set(projects.map(p => p.category))];

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = cors(handler);
