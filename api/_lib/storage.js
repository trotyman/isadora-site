const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Configuração do Cloudflare R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'isadora-uploads';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-c223da626df34d90984474e07d938a70.r2.dev';

// Cliente S3 configurado para R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  // IMPORTANTE: Necessário para SDK v3.729.0+ (evita erros de checksum)
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

// Tipos de arquivo permitidos
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

function isAllowedType(mimeType) {
  return mimeType in ALLOWED_TYPES;
}

async function uploadFile(projectId, filename, buffer, mimeType) {
  const key = `projects/${projectId}/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Retorna a URL pública do arquivo
  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

  return {
    key,
    url,
    filename,
    mimeType,
    size: buffer.length,
    type: getFileType(mimeType)
  };
}

async function deleteFile(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo do R2:', error);
    return false;
  }
}

// Extrai a key da URL do R2
function getKeyFromUrl(url) {
  if (!url) return null;

  // Tenta extrair a key da URL
  const patterns = [
    /r2\.dev\/(.+)$/,
    /r2\.cloudflarestorage\.com\/(.+)$/,
    /projects\/(.+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[0].startsWith('projects/') ? match[0] : `projects/${match[1]}`;
    }
  }

  return null;
}

// Função para testar conexão com R2
async function testConnection() {
  try {
    const result = await s3Client.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, MaxKeys: 1 })
    );
    console.log('R2 conexão OK. Objetos:', result.Contents?.length || 0);
    return { success: true, objects: result.Contents?.length || 0 };
  } catch (error) {
    console.error('Erro de conexão R2:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileType,
  isAllowedType,
  getKeyFromUrl,
  testConnection,
  ALLOWED_TYPES
};
