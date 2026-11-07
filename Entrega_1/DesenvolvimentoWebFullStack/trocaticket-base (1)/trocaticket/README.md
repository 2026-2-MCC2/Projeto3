# TrocaTicket — Front-end (Entrega 1)

React + Vite + React Router.

## Como rodar

```bash
npm install
npm run dev
```

## Estrutura

- `src/components/` componentes reutilizáveis (Header, Footer, Layout, TextField, Button, OtpInput...)
- `src/components/admin/` componentes exclusivos do painel administrativo (layout responsivo, sidebar, barra superior, busca global, gráficos, modais, notificações e exportação)
- `src/pages/` uma página por rota
- `src/pages/admin/` telas do painel do administrador (Visão Geral, Aprovações, Cadastros, Eventos, detalhe do evento, Cotações e Relatórios)
- `src/services/` serviços do sistema e API simulada do painel administrativo
- `src/context/` e `src/hooks/` sessão do usuário (AuthProvider, useAuth)
- `src/utils/` validadores e mapa de rotas
- `src/styles/` tokens (cores, tipografia, espaçamento) e estilos base
- `public/mock/usuarios.json` "API" mockada de usuários
- `src/utils/admin/` formatação, validações e exportação CSV/PDF/PNG do painel administrativo
- `src/styles/` tokens (cores, tipografia, espaçamento), estilos base e estilos compartilhados do painel admin
- `public/mock/` "API" mockada (usuários, aprovações, cadastros, eventos, cotações, relatórios)

## Painel do administrador (`/admin`)

Acessível após login em `/login-admin` (conta de teste abaixo). O painel tem layout próprio, com sidebar responsiva, barra superior com busca global, notificações e tema visual isolado das áreas pública, organizador e fornecedor.

| Rota | Tela |
|---|---|
| `/admin` | Visão geral com indicadores, gráficos e fila de aprovações |
| `/admin/aprovacoes` | Análise de cadastros pendentes, checklist e aprovação/rejeição com justificativa |
| `/admin/usuarios` | Cadastros homologados, filtros, paginação e suspensão/reativação |
| `/admin/eventos` e `/admin/eventos/:id` | Lista de eventos e página de detalhes |
| `/admin/cotacoes` | Cotações, prazos e comparação de propostas |
| `/admin/relatorios` | Gerador de relatórios e auditoria |

A rota `/admin/cadastros` redireciona para `/admin/usuarios`. Rotas administrativas inexistentes exibem uma página 404 dentro do próprio painel. Os gráficos permitem alternar o formato e as telas oferecem exportação quando aplicável.

**Dados do admin:** o painel usa atualmente dados demonstrativos definidos em `src/services/adminSeed.js`; as leituras e alterações simuladas passam por `src/services/adminApi.js` e ficam em memória/sessionStorage. Isso não grava em um backend real. Os documentos da tela de Aprovações também são placeholders até a integração com um serviço de arquivos. Para conectar o backend, substitua as funções de `adminApi.js` por chamadas à API mantendo os contratos usados pelas telas.

O comando `npm test` executa os testes dos serviços e utilitários, incluindo os novos testes do painel administrativo.

## Contas de teste (dados mockados)

| Perfil | E-mail | Senha | MFA |
|---|---|---|---|
| Organizador | organizador@trocaticket.com.br | Troca@2026 | — |
| Fornecedor | fornecedor@trocaticket.com.br | Troca@2026 | — |
| Administrador (`/login-admin`) | gestao.auditoria@trocaticket.com.br | Admin@2026 | 123456 |

## Integrantes

- Cintya Mendoza Apaza
- Davi Moraes Muniz
- Gustavo Cordeiro
- Nicolas Moumdjian
