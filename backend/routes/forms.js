const express = require('express');

const router = express.Router();

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

function getWeb3FormsAccessKey() {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  return key && key.trim() ? key.trim() : null;
}

// POST /api/forms/projeto
// Proxy server-side para Web3Forms (mantém access_key fora do frontend)
router.post('/projeto', async (req, res) => {
  try {
    const accessKey = getWeb3FormsAccessKey();

    if (!accessKey) {
      return res.status(503).json({
        success: false,
        message: 'Formulário não configurado (WEB3FORMS_ACCESS_KEY ausente)'
      });
    }

    const {
      nome,
      email,
      telefone,
      tipo_projeto,
      mensagem,
      botcheck
    } = req.body || {};

    // Honeypot (se vier preenchido, tratar como spam)
    if (botcheck) {
      return res.status(200).json({ success: true });
    }

    if (!nome || !email || !tipo_projeto || !mensagem) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios ausentes'
      });
    }

    // Envio no formato JSON conforme Web3Forms (Accept: application/json)
    const payload = {
      access_key: accessKey,
      from_name: 'Site Isadora Carvalho Arquitetura',
      subject: `Novo contato do site - ${tipo_projeto || 'Projeto'}`,
      nome,
      email,
      telefone: telefone || 'Não informado',
      tipo_projeto,
      mensagem,
      botcheck: ''
    };

    console.log('Enviando para Web3Forms:', JSON.stringify(payload, null, 2));

    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    console.log('Web3Forms response status:', response.status);
    console.log('Web3Forms response body:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    if (!response.ok || !data) {
      return res.status(502).json({
        success: false,
        message: `Falha ao enviar para o Web3Forms (status ${response.status})`
      });
    }

    if (data.success) {
      return res.json({ success: true });
    }

    return res.status(400).json({
      success: false,
      message: data.message || 'Erro ao enviar formulário'
    });
  } catch (error) {
    console.error('Erro no proxy Web3Forms:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
