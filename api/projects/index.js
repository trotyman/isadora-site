const { getProjects, setProjects, generateId, generateSlug } = require('../_lib/db');
const { adminMiddleware, getTokenFromRequest, verifyToken } = require('../_lib/auth');
const { cors } = require('../_lib/cors');

async function handleGet(req, res) {
  try {
    const { category, featured } = req.query;
    let projects = await getProjects();

    // Filtrar apenas publicados para requisições públicas
    projects = projects.filter(p => p.status === 'published');

    if (category) {
      projects = projects.filter(p => p.category === category);
    }

    if (featured === 'true') {
      projects = projects.filter(p => p.featured);
    }

    // Ordenar por data de criação (mais recente primeiro)
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

async function handlePost(req, res) {
  // Verificar autenticação manualmente para POST
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
  }

  try {
    const projectData = req.body;
    const projects = await getProjects();

    const project = {
      id: generateId(),
      title: projectData.title,
      slug: generateSlug(projectData.title),
      description: projectData.description || '',
      fullDescription: projectData.fullDescription || '',
      category: projectData.category || 'residencial',
      location: projectData.location || '',
      area: projectData.area || '',
      year: projectData.year || new Date().getFullYear(),
      client: projectData.client || '',
      status: projectData.status || 'draft',
      featured: projectData.featured || false,
      coverImage: projectData.coverImage || null,
      files: projectData.files || [],
      tags: projectData.tags || [],
      order: projects.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(project);
    await setProjects(projects);

    return res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

module.exports = cors(handler);
