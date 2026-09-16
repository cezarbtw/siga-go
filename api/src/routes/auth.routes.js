const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { SEGREDO_JWT } = require('../middleware/auth');

const router = express.Router();

// Hash simples de senha (SHA-256 + salt fixo apenas para fins didáticos do trabalho acadêmico)
function hashSenha(senha) {
  return crypto.createHash('sha256').update(senha + 'siga-go-salt').digest('hex');
}

// POST /api/auth/registrar
router.post('/registrar', (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, perfil.' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(nome, email, hashSenha(senha), perfil);
    return res.status(201).json({ id: info.lastInsertRowid, nome, email, perfil });
  } catch (e) {
    return res.status(400).json({ erro: 'Não foi possível registrar o usuário.', detalhe: e.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!usuario || usuario.senha_hash !== hashSenha(senha)) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
    SEGREDO_JWT,
    { expiresIn: '8h' }
  );

  return res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } });
});

module.exports = router;
