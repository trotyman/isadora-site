const sharp = require('sharp');

// Logo SVG inline para watermark
const WATERMARK_SVG = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1524 572" width="1524" height="572">
  <path fill="#cc8a7a" fill-rule="evenodd" d="m197.5 1.56c-5.5 0.75-14.5 2.33-20 3.51-5.5 1.18-14.05 3.4-19 4.92-4.95 1.53-13.05 4.34-18 6.25-4.95 1.9-14.63 6.33-21.5 9.83-6.88 3.51-17.45 9.69-23.5 13.75-6.05 4.06-14.6 10.42-19 14.15-4.4 3.72-12.15 10.99-17.22 16.15-5.07 5.16-11.56 12.3-14.42 15.88-2.86 3.58-7.99 10.78-11.41 16-3.42 5.22-8.27 13.33-10.78 18-2.51 4.67-6.58 13.68-9.06 20-2.47 6.32-5.84 16.68-7.48 23-1.63 6.32-3.68 16.56-4.55 22.75-1.39 9.92-1.58 33.31-1.58 197.75v186.5h90.5c-1.13-53.86-2.01-95.38-2.68-127-0.94-44.54-0.94-63.13-0.03-82.5 0.66-13.75 1.89-31.07 2.75-38.5 0.86-7.43 2.7-18.68 4.08-25 1.39-6.32 4.31-16.9 6.49-23.5 2.17-6.6 6.86-17.85 10.41-25 3.55-7.15 9.5-17.25 13.22-22.45 3.72-5.2 10.58-13.37 15.26-18.16l8.5-8.7c10.85-1.31 21.43-1.65 30.5-1.59 10.87 0.06 19.91 0.69 26.5 1.85 5.5 0.97 15.4 3.53 22 5.7 6.6 2.17 16.28 6.18 21.5 8.92 5.22 2.73 13.55 8 18.5 11.7 4.95 3.7 12.37 10.11 16.5 14.23 4.12 4.13 10.43 11.4 14 16.16 3.57 4.76 8.61 12.19 11.18 16.5 2.58 4.31 6.69 12.34 9.13 17.84 2.45 5.5 5.89 14.27 7.64 19.5 1.76 5.23 4.25 14 5.54 19.5 1.28 5.5 2.85 13.38 3.47 17.5 0.62 4.12 1.84 14.7 2.71 23.5 1.19 12.06 1.67 31.33 1.95 78.25l0.38 62.25h40.5l-0.5 58h76c0.95-237.54 1-322.7 0.72-342.5-0.43-30.62-0.82-37.64-2.57-47-1.13-6.05-3.36-15.5-4.95-21-1.59-5.5-4.6-14.28-6.68-19.5-2.08-5.22-5.02-11.97-6.53-15-1.51-3.03-5-9.33-7.75-14-2.75-4.67-8.34-13-12.42-18.5-4.08-5.5-11.89-14.67-17.37-20.38-5.47-5.71-14.45-14.01-19.95-18.44-5.5-4.43-14.73-11.14-20.5-14.91-5.77-3.76-15.23-9.25-21-12.19-5.77-2.94-14.55-6.95-19.5-8.92-4.95-1.96-13.27-4.89-18.5-6.5-5.23-1.62-13.77-3.87-19-5-5.23-1.13-14.79-2.76-21.25-3.61-7.55-1-18.81-1.51-31.5-1.45-10.86 0.06-24.25 0.72-29.75 1.46z"/>
</svg>`;

// Configurações da marca d'água
const WATERMARK_CONFIG = {
  widthPercent: 20,
  opacity: 0.7,
  margin: 30,
  position: 'bottom-right'
};

// URL base do R2
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-c223da626df34d90984474e07d938a70.r2.dev';

/**
 * API que serve imagens com watermark aplicada em tempo real
 * URL: /api/image/projects/123/filename.jpg
 */
module.exports = async (req, res) => {
  try {
    // Extrair o path da imagem
    const { path } = req.query;
    const imagePath = Array.isArray(path) ? path.join('/') : path;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Path da imagem não fornecido' });
    }

    // Construir URL original do R2
    const originalUrl = `${R2_PUBLIC_URL}/${imagePath}`;
    
    console.log('Processando watermark para:', originalUrl);

    // Buscar a imagem original do R2
    const imageResponse = await fetch(originalUrl);
    
    if (!imageResponse.ok) {
      console.error('Erro ao buscar imagem:', imageResponse.status);
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    const contentType = imageResponse.headers.get('content-type');
    
    // Se não for imagem, redirecionar para URL original
    if (!contentType || !contentType.startsWith('image/')) {
      return res.redirect(originalUrl);
    }

    // Converter para buffer
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Aplicar watermark
    const watermarkedBuffer = await applyWatermark(imageBuffer, contentType);

    // Configurar headers de cache (1 hora)
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('Content-Type', contentType);
    
    return res.send(watermarkedBuffer);

  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    return res.status(500).json({ error: 'Erro ao processar imagem' });
  }
};

/**
 * Aplica marca d'água na imagem
 */
async function applyWatermark(imageBuffer, mimeType) {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Calcular tamanho da marca d'água
    const watermarkWidth = Math.round(metadata.width * (WATERMARK_CONFIG.widthPercent / 100));
    
    // Criar watermark a partir do SVG
    const watermarkBuffer = await sharp(Buffer.from(WATERMARK_SVG))
      .resize(watermarkWidth)
      .png()
      .toBuffer();

    // Obter dimensões da marca d'água
    const watermarkMeta = await sharp(watermarkBuffer).metadata();

    // Calcular posição (bottom-right)
    const left = Math.max(0, metadata.width - watermarkWidth - WATERMARK_CONFIG.margin);
    const top = Math.max(0, metadata.height - watermarkMeta.height - WATERMARK_CONFIG.margin);

    // Aplicar opacidade
    const watermarkWithOpacity = await sharp(watermarkBuffer)
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(255 * WATERMARK_CONFIG.opacity)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    // Compor imagem final
    const result = await image.composite([{
      input: watermarkWithOpacity,
      left: left,
      top: top,
      blend: 'over'
    }]);

    // Retornar no formato original
    if (mimeType === 'image/jpeg') {
      return result.jpeg({ quality: 85 }).toBuffer();
    } else if (mimeType === 'image/webp') {
      return result.webp({ quality: 85 }).toBuffer();
    }
    
    return result.png().toBuffer();

  } catch (error) {
    console.error('Erro ao aplicar watermark:', error);
    return imageBuffer; // Retorna original em caso de erro
  }
}
