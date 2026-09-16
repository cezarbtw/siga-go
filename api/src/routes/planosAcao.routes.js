const express = require('express');
const db = require('../db/database');
const { autenticar, autorizar } = require('../middleware/auth');

const router = express.Router();

// POST /api/planos-acao - cria uma etapa do plano de ação (ciclo PDCA da ISO 14001)
// vinculada a uma ocorrência ambiental.
router.post('/', autenticar, autorizar('GESTOR_AMBIENTAL', 'AUDITOR'), (req, res) => {
  const { ocorrencia_id, etapa_pdca, descricao, responsavel, prazo } = req.body;

  if (!ocorrencia_id || !etapa_pdca || !descricao || !responsavel) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: ocorrencia_id, etapa_pdca, descricao, responsavel.'
    });
  }

  const ocorrencia = db.prepare('SELECT id FROM ocorrencias WHERE id = ?').get(ocorrencia_id);
  if (!ocorrencia) return res.status(404).json({ erro: 'Ocorrência associada não encontrada.' });

  const stmt = db.prepare(`INSERT INTO planos_acao
    (ocorrencia_id, etapa_pdca, descricao, responsavel, prazo)
    VALUES (?, ?, ?, ?, ?)`);
  const info = stmt.run(ocorrencia_id, etapa_pdca, descricao, responsavel, prazo || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

// PATCH /api/planos-acao/:id - atualiza o status de execução da etapa
router.patch('/:id', autenticar, autorizar('GESTOR_AMBIENTAL', 'AUDITOR'), (req, res) => {
  const { status } = req.body;
  const permitido = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA'];
  if (!permitido.includes(status)) {
    return res.status(400).json({ erro: `Status deve ser um dos: ${permitido.join(', ')}` });
  }
  const info = db.prepare('UPDATE planos_acao SET status = ? WHERE id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ erro: 'Plano de ação não encontrado.' });
  res.json({ mensagem: 'Plano de ação atualizado.' });
});

module.exports = router;
