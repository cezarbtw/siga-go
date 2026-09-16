# SIGA-GO — Sistema Web de Gestão Ambiental do Estado de Goiás

Projeto de Atividades Práticas Supervisionadas (APS) — Web Service + aplicação cliente.

## Estrutura
- `api/` — Web Service REST (Node.js + Express + SQLite)
- `web/` — Aplicação cliente (painel HTML/CSS/JS que consome a API)

## Como executar

### 1. Web Service (API)
```bash
cd api
npm install
node src/app.js
```
A API sobe em http://localhost:3000 (rota de teste: GET /api/status).

### 2. Aplicação cliente
Basta abrir o arquivo `web/index.html` diretamente no navegador
(ou servir com `npx serve web`). Use o botão "Criar usuário demonstração"
na tela de login para gerar um usuário de teste, depois clique em "Entrar".

## Endpoints principais
Veja a Seção 5.9 do relatório (APS_SIGA-GO.docx) para a lista completa de
endpoints do Web Service.

## Observação
Este projeto foi gerado como ponto de partida para o trabalho semestral.
O grupo deve revisar, testar, personalizar (nomes, RA, instituição) e
adaptar o código e o relatório conforme a orientação do professor
supervisor antes da entrega.
