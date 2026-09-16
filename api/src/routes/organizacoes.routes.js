const express = require('express');
const db = require('../db/database');
const { autenticar, autorizar } = require('../middleware/auth');

const router = express.Router();

// GET /api/organizacoes - lista todas as organizações (com filtro opcional por município)
router.get('/', autenticar, (req, res) => {
  const { municipio } = req.query;
  let linhas;
  if (municipio) {
    linhas = db.prepare('SELECT * FROM organizacoes WHERE municipio = ?').all(municipio);
  } else {
    linhas = db.prepare('SELECT * FROM organizacoes ORDER BY razao_social').all();
  }
  res.json(linhas);
});

// GET /api/organizacoes/:id
router.get('/:id', autenticar, (req, res) => {
  const org = db.prepare('SELECT * FROM organizacoes WHERE id = ?').get(req.params.id);
  if (!org) return res.status(404).json({ erro: 'Organização não encontrada.' });
  res.json(org);
});

// POST /api/organizacoes - cadastra organização (apenas Gestor Ambiental ou Órgão Fiscalizador)
router.post('/', autenticar, autorizar('GESTOR_AMBIENTAL', 'ORGAO_FISCALIZADOR'), (req, res) => {
  const { razao_social, cnpj, municipio, setor, certificacao_iso14001 } = req.body;
  if (!razao_social || !cnpj || !municipio || !setor) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  }
  const stmt = db.prepare(`INSERT INTO organizacoes
    (razao_social, cnpj, municipio, setor, certificacao_iso14001)
    VALUES (?, ?, ?, ?, ?)`);
  const info = stmt.run(razao_social, cnpj, municipio, setor, certificacao_iso14001 ? 1 : 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

// PUT /api/organizacoes/:id
router.put('/:id', autenticar, autorizar('GESTOR_AMBIENTAL', 'ORGAO_FISCALIZADOR'), (req, res) => {
  const existente = db.prepare('SELECT * FROM organizacoes WHERE id = ?').get(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Organização não encontrada.' });

  const dados = { ...existente, ...req.body };
  db.prepare(`UPDATE organizacoes SET razao_social=?, cnpj=?, municipio=?, setor=?, certificacao_iso14001=?
              WHERE id=?`).run(
    dados.razao_social, dados.cnpj, dados.municipio, dados.setor,
    dados.certificacao_iso14001 ? 1 : 0, req.params.id
  );
  res.json({ mensagem: 'Organização atualizada com sucesso.' });
});

// DELETE /api/organizacoes/:id
router.delete('/:id', autenticar, autorizar('ORGAO_FISCALIZADOR'), (req, res) => {
  db.prepare('DELETE FROM organizacoes WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
