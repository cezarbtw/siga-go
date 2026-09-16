const express = require('express');
const db = require('../db/database');
const { autenticar, autorizar } = require('../middleware/auth');

const router = express.Router();

// POST /api/indicadores - lança indicadores de sustentabilidade de um período
router.post('/', autenticar, autorizar('GESTOR_AMBIENTAL'), (req, res) => {
  const {
    organizacao_id, periodo,
    residuos_reciclados_kg, emissoes_evitadas_kg_co2, agua_reutilizada_litros
  } = req.body;

  if (!organizacao_id || !periodo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: organizacao_id, periodo.' });
  }

  const stmt = db.prepare(`INSERT INTO indicadores
    (organizacao_id, periodo, residuos_reciclados_kg, emissoes_evitadas_kg_co2, agua_reutilizada_litros)
    VALUES (?, ?, ?, ?, ?)`);
  const info = stmt.run(
    organizacao_id, periodo,
    residuos_reciclados_kg || 0, emissoes_evitadas_kg_co2 || 0, agua_reutilizada_litros || 0
  );
  res.status(201).json({ id: info.lastInsertRowid });
});

// GET /api/indicadores/resumo - agrega indicadores de todas as organizações (dashboard)
router.get('/resumo', autenticar, (req, res) => {
  const resumo = db.prepare(`
    SELECT
      SUM(residuos_reciclados_kg)     AS total_residuos_reciclados_kg,
      SUM(emissoes_evitadas_kg_co2)   AS total_emissoes_evitadas_kg_co2,
      SUM(agua_reutilizada_litros)    AS total_agua_reutilizada_litros,
      COUNT(DISTINCT organizacao_id)  AS organizacoes_reportando
    FROM indicadores
  `).get();

  const porOrganizacao = db.prepare(`
    SELECT o.razao_social,
           SUM(i.residuos_reciclados_kg)   AS residuos_reciclados_kg,
           SUM(i.emissoes_evitadas_kg_co2) AS emissoes_evitadas_kg_co2
    FROM indicadores i
    JOIN organizacoes o ON o.id = i.organizacao_id
    GROUP BY o.id
    ORDER BY emissoes_evitadas_kg_co2 DESC
  `).all();

  res.json({ resumo, por_organizacao: porOrganizacao });
});

// GET /api/indicadores/organizacao/:id
router.get('/organizacao/:id', autenticar, (req, res) => {
  const linhas = db.prepare(
    'SELECT * FROM indicadores WHERE organizacao_id = ? ORDER BY periodo'
  ).all(req.params.id);
  res.json(linhas);
});

module.exports = router;
