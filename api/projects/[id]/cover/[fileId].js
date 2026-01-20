const { getProjects, setProjects } = require('../../../_lib/db');
const { getTokenFromRequest, verifyToken } = require('../../../_lib/auth');
const { cors } = require('../../../_lib/cors');

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Verificar autenticação
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
  }

  const { id: projectId, fileId } = req.query;

  try {
    const projects = await getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const project = projects[projectIndex];
    const file = project.files.find(f => f.id === fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    if (file.type !== 'image') {
      return res.status(400).json({
        success: false,
        message: 'Apenas imagens podem ser definidas como capa'
      });
    }

    project.coverImage = fileId;
    project.updatedAt = new Date().toISOString();
    await setProjects(projects);

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao definir capa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = cors(handler);
