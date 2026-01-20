const { getProjects, setProjects } = require('../../_lib/db');
const { adminMiddleware } = require('../../_lib/auth');
const { cors } = require('../../_lib/cors');

async function handler(req, res) {
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

module.exports = cors(adminMiddleware(handler));
