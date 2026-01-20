const { deleteFile } = require('../../../_lib/storage');
const { getProjects, setProjects } = require('../../../_lib/db');
const { getTokenFromRequest, verifyToken } = require('../../../_lib/auth');
const { cors } = require('../../../_lib/cors');

async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    const fileIndex = project.files.findIndex(f => f.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    const file = project.files[fileIndex];

    // Deletar do Cloudflare R2 se tiver key
    if (file.key) {
      try {
        await deleteFile(file.key);
      } catch (r2Error) {
        console.error('Erro ao deletar do R2:', r2Error);
        // Continuar mesmo se falhar a deleção do R2
      }
    }

    // Remover arquivo do projeto
    project.files.splice(fileIndex, 1);

    // Se era a capa, remover referência
    if (project.coverImage === fileId) {
      project.coverImage = null;
    }

    project.updatedAt = new Date().toISOString();
    await setProjects(projects);

    return res.status(200).json({
      success: true,
      message: 'Arquivo excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

module.exports = cors(handler);
