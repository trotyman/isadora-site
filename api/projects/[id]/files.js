const { put } = require('@vercel/blob');
const { getProjects, setProjects, generateId } = require('../../_lib/db');
const { getTokenFromRequest, verifyToken } = require('../../_lib/auth');
const { cors } = require('../../_lib/cors');

// Tipos permitidos (imagens e PDFs)
const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/pdf': 'document'
};

function getFileType(mimeType) {
  return ALLOWED_TYPES[mimeType] || null;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
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

  const { id: projectId } = req.query;

  try {
    const projects = await getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }

    // Ler o body como buffer para upload
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse multipart form data manualmente (simplificado)
    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      // Aceitar JSON com base64 como fallback
      let body;
      try {
        body = JSON.parse(buffer.toString());
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Formato inválido. Use multipart/form-data ou JSON com base64.'
        });
      }

      if (!body.files || !Array.isArray(body.files)) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado'
        });
      }

      const uploadedFiles = [];

      for (const file of body.files) {
        if (!file.data || !file.name || !file.type) {
          continue;
        }

        const fileType = getFileType(file.type);
        if (!fileType) {
          continue;
        }

        // Decodificar base64
        const fileBuffer = Buffer.from(file.data, 'base64');

        // Upload para Vercel Blob
        const blob = await put(`projects/${projectId}/${Date.now()}-${file.name}`, fileBuffer, {
          access: 'public',
          contentType: file.type
        });

        const fileRecord = {
          id: generateId(),
          filename: file.name,
          originalName: file.name,
          type: fileType,
          mimeType: file.type,
          size: fileBuffer.length,
          url: blob.url,
          path: blob.url,
          uploadedAt: new Date().toISOString()
        };

        uploadedFiles.push(fileRecord);
      }

      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo válido enviado. Tipos aceitos: JPG, PNG, WEBP, GIF, PDF'
        });
      }

      // Adicionar arquivos ao projeto
      const project = projects[projectIndex];
      project.files = project.files || [];
      project.files.push(...uploadedFiles);
      project.updatedAt = new Date().toISOString();

      await setProjects(projects);

      return res.status(200).json({
        success: true,
        files: uploadedFiles
      });
    }

    // Para multipart/form-data, usar parsing simplificado
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({
        success: false,
        message: 'Boundary não encontrado no content-type'
      });
    }

    const parts = buffer.toString('binary').split(`--${boundary}`);
    const uploadedFiles = [];

    for (const part of parts) {
      if (part.includes('filename=')) {
        const filenameMatch = part.match(/filename="([^"]+)"/);
        const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);

        if (!filenameMatch || !contentTypeMatch) continue;

        const filename = filenameMatch[1];
        const mimeType = contentTypeMatch[1].trim();
        const fileType = getFileType(mimeType);

        if (!fileType) continue;

        // Extrair dados do arquivo (após headers duplo CRLF)
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        const fileData = part.slice(headerEnd + 4, part.lastIndexOf('\r\n'));
        const fileBuffer = Buffer.from(fileData, 'binary');

        // Upload para Vercel Blob
        const blob = await put(`projects/${projectId}/${Date.now()}-${filename}`, fileBuffer, {
          access: 'public',
          contentType: mimeType
        });

        const fileRecord = {
          id: generateId(),
          filename: filename,
          originalName: filename,
          type: fileType,
          mimeType: mimeType,
          size: fileBuffer.length,
          url: blob.url,
          path: blob.url,
          uploadedAt: new Date().toISOString()
        };

        uploadedFiles.push(fileRecord);
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo válido enviado. Tipos aceitos: JPG, PNG, WEBP, GIF, PDF'
      });
    }

    // Adicionar arquivos ao projeto
    const project = projects[projectIndex];
    project.files = project.files || [];
    project.files.push(...uploadedFiles);
    project.updatedAt = new Date().toISOString();

    await setProjects(projects);

    return res.status(200).json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
}

module.exports = cors(handler);
