const { getProjects, setProjects, generateSlug } = require('../_lib/db');
const { getTokenFromRequest, verifyToken } = require('../_lib/auth');
const { cors } = require('../_lib/cors');

async function handleGet(req, res, projectId) {
  try {
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Se não estiver autenticado, só mostra projetos publicados
    const token = getTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user && project.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

async function handlePut(req, res, projectId) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
  }

  try {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === projectId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    const projectData = req.body;

    // Se o título mudou, atualiza o slug
    if (projectData.title && projectData.title !== projects[index].title) {
      projectData.slug = generateSlug(projectData.title);
    }

    projects[index] = {
      ...projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    await setProjects(projects);

    return res.status(200).json({
      success: true,
      project: projects[index]
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

async function handleDelete(req, res, projectId) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
  }

  try {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === projectId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    projects.splice(index, 1);
    await setProjects(projects);

    return res.status(200).json({
      success: true,
      message: 'Projeto excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, id);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

module.exports = cors(handler);
