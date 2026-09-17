/**
 * PLAMA-GO — Plataforma de Monitoramento e Ação Ambiental de Goiás
 * Web Service (API REST) desenvolvido em Node.js + Express + SQLite.
 *
 * Trabalho de Atividades Práticas Supervisionadas (APS)
 * 7º/8º período - Ciência da Computação
 */
const express = require('express');
const cors = require('cors');

const path = require('path');

const authRoutes = require('./routes/auth.routes');
const organizacoesRoutes = require('./routes/organizacoes.routes');
const ocorrenciasRoutes = require('./routes/ocorrencias.routes');
const planosAcaoRoutes = require('./routes/planosAcao.routes');
const indicadoresRoutes = require('./routes/indicadores.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos da interface web (frontend)
app.use(express.static(path.join(__dirname, '../../web')));

// Rota de verificação de disponibilidade do serviço
app.get('/api/status', (req, res) => {
  res.json({ servico: 'PLAMA-GO', status: 'online', versao: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizacoes', organizacoesRoutes);
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/planos-acao', planosAcaoRoutes);
app.use('/api/indicadores', indicadoresRoutes);

// Tratamento de erros não previstos
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`PLAMA-GO Web Service rodando em http://localhost:${PORTA}`);
});

module.exports = app;
