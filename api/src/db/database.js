const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'plama_go.db'));
db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------
// Esquema do banco de dados
// ---------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK(perfil IN ('GESTOR_AMBIENTAL','AUDITOR','ORGAO_FISCALIZADOR')),
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  municipio TEXT NOT NULL,
  setor TEXT NOT NULL,
  certificacao_iso14001 INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ocorrencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizacao_id INTEGER REFERENCES organizacoes(id),
  tipo TEXT NOT NULL CHECK(tipo IN ('DESMATAMENTO','DESCARTE_IRREGULAR','POLUICAO_HIDRICA','QUEIMADA','OUTRO')),
  municipio TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  descricao TEXT NOT NULL,
  gravidade TEXT NOT NULL CHECK(gravidade IN ('BAIXA','MEDIA','ALTA','CRITICA')),
  status TEXT NOT NULL DEFAULT 'ABERTA' CHECK(status IN ('ABERTA','EM_ANALISE','EM_TRATAMENTO','RESOLVIDA','ARQUIVADA')),
  registrado_por INTEGER REFERENCES usuarios(id),
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planos_acao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ocorrencia_id INTEGER NOT NULL REFERENCES ocorrencias(id),
  etapa_pdca TEXT NOT NULL CHECK(etapa_pdca IN ('PLAN','DO','CHECK','ACT')),
  descricao TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  prazo TEXT,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK(status IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDA','ATRASADA')),
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS indicadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizacao_id INTEGER NOT NULL REFERENCES organizacoes(id),
  periodo TEXT NOT NULL,
  residuos_reciclados_kg REAL DEFAULT 0,
  emissoes_evitadas_kg_co2 REAL DEFAULT 0,
  agua_reutilizada_litros REAL DEFAULT 0,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
