const jwt = require('jsonwebtoken');

const SEGREDO_JWT = process.env.JWT_SECRET || 'siga-go-segredo-desenvolvimento';

// Middleware que valida o token JWT enviado no cabeçalho Authorization.
function autenticar(req, res, next) {
  const cabecalho = req.headers['authorization'];
  const token = cabecalho && cabecalho.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token de acesso não informado.' });
  }

  jwt.verify(token, SEGREDO_JWT, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.usuario = usuario;
    next();
  });
}

// Middleware que restringe o acesso a determinados perfis (RBAC simples).
function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Perfil sem permissão para esta operação.' });
    }
    next();
  };
}

module.exports = { autenticar, autorizar, SEGREDO_JWT };
