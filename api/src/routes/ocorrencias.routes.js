const express = require('express');
const db = require('../db/database');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// GET /api/ocorrencias - lista ocorrências, com filtros opcionais
router.get('/', autenticar, (req, res) => {
  const { status, gravidade, municipio } = req.query;
  let sql = 'SELECT * FROM ocorrencias WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (gravidade) { sql += ' AND gravidade = ?'; params.push(gravidade); }
  if (municipio) { sql += ' AND municipio = ?'; params.push(municipio); }
  sql += ' ORDER BY criado_em DESC';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/ocorrencias/:id
router.get('/:id', autenticar, (req, res) => {
  const ocorrencia = db.prepare('SELECT * FROM ocorrencias WHERE id = ?').get(req.params.id);
  if (!ocorrencia) return res.status(404).json({ erro: 'Ocorrência não encontrada.' });

  const planos = db.prepare('SELECT * FROM planos_acao WHERE ocorrencia_id = ?').all(req.params.id);
  res.json({ ...ocorrencia, planos_acao: planos });
});

// POST /api/ocorrencias - registra nova ocorrência ambiental (denúncia)
router.post('/', autenticar, (req, res) => {
  const { organizacao_id, tipo, municipio, latitude, longitude, descricao, gravidade } = req.body;

  if (!tipo || !municipio || !descricao || !gravidade) {
    return res.status(400).json({ erro: 'Campos obrigatórios: tipo, municipio, descricao, gravidade.' });
  }

  const stmt = db.prepare(`INSERT INTO ocorrencias
    (organizacao_id, tipo, municipio, latitude, longitude, descricao, gravidade, registrado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(
    organizacao_id || null, tipo, municipio, latitude || null, longitude || null,
    descricao, gravidade, req.usuario.id
  );
  res.status(201).json({ id: info.lastInsertRowid });
});

// PATCH /api/ocorrencias/:id/status - atualiza o status de tratamento da ocorrência
router.patch('/:id/status', autenticar, (req, res) => {
  const { status } = req.body;
  const permitido = ['ABERTA', 'EM_ANALISE', 'EM_TRATAMENTO', 'RESOLVIDA', 'ARQUIVADA'];
  if (!permitido.includes(status)) {
    return res.status(400).json({ erro: `Status deve ser um dos: ${permitido.join(', ')}` });
  }
  const info = db.prepare('UPDATE ocorrencias SET status = ? WHERE id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ erro: 'Ocorrência não encontrada.' });
  res.json({ mensagem: 'Status atualizado.' });
});

module.exports = router;
