# TrocaTicket — Front-end (Entrega 1)

React + Vite + React Router.

## Como rodar

```bash
npm install
npm run dev
```

Para usar o backend, inicie-o em `Entrega_2/DesenvolvimentoWebFullStack/backend` e configure `.env` com base em `.env.example` no frontend quando necessário. O Vite encaminha `/api` para `http://localhost:3000` por padrão.

## Deploy no Railway

O serviço do front-end deve usar esta pasta como raiz. O arquivo `railway.json` configura a build e o servidor estático da pasta `dist`; defina `VITE_API_URL` com a URL pública do serviço backend antes da build.

## Estrutura

- `src/components/` componentes reutilizáveis (Header, Footer, Layout, TextField, Button, OtpInput...)
- `src/components/admin/` componentes exclusivos do painel administrativo (layout responsivo, sidebar, barra superior, busca global, gráficos, modais, notificações e exportação)
- `src/pages/` uma página por rota
- `src/pages/admin/` telas do painel do administrador (Visão Geral, Aprovações, Cadastros, Eventos, detalhe do evento, Cotações e Relatórios)
- `src/services/` clientes da API, autenticação/eventos e integrações administrativas
- `src/context/` e `src/hooks/` sessão do usuário (AuthProvider, useAuth)
- `src/utils/` validadores e mapa de rotas
- `src/styles/` tokens (cores, tipografia, espaçamento) e estilos base
- `public/mock/usuarios.json` "API" mockada de usuários
- `src/utils/admin/` formatação, validações e exportação CSV/PDF/PNG do painel administrativo
- `src/styles/` tokens (cores, tipografia, espaçamento), estilos base e estilos compartilhados do painel admin
- `public/mock/` "API" mockada (usuários, aprovações, cadastros, eventos, cotações, relatórios)

## Painel do administrador (`/admin`)

O painel tem layout próprio, com sidebar responsiva, barra superior com busca global, notificações e tema visual isolado das áreas pública, organizador e fornecedor. Contas `ADMIN` são provisionadas diretamente no banco e autenticadas com MFA TOTP.

| Rota | Tela |
|---|---|
| `/admin` | Visão geral com indicadores, gráficos e fila de aprovações |
| `/admin/aprovacoes` | Análise de cadastros pendentes, checklist e aprovação/rejeição com justificativa |
| `/admin/usuarios` | Cadastros homologados, filtros, paginação e suspensão/reativação |
| `/admin/eventos` e `/admin/eventos/:id` | Lista de eventos e página de detalhes |
| `/admin/cotacoes` | Cotações, prazos e comparação de propostas |
| `/admin/relatorios` | Gerador de relatórios e auditoria |

A rota `/admin/cadastros` redireciona para `/admin/usuarios`. Rotas administrativas inexistentes exibem uma página 404 dentro do próprio painel. Os gráficos permitem alternar o formato e as telas oferecem exportação quando aplicável.

**Integração disponível:** cadastro com aprovação, consulta de status, login, sessão, documentos enviados, eventos do organizador e autenticação administrativa com MFA usam a API real. O painel administrativo também conecta aprovações, checklist, documentos, cadastros, suspensão/reativação, auditoria e listagem de eventos. Métricas de vendas/pagamentos, cotações, propostas de fornecedores e mensagens ainda não têm endpoints; essas telas informam essa limitação em vez de apresentar dados fictícios. Para uma base existente, aplique as migrações do backend.

O comando `npm test` executa os testes dos serviços e utilitários, incluindo os novos testes do painel administrativo.

## Integrantes

- Cintya Mendoza Apaza
- Davi Moraes Muniz
- Gustavo Cordeiro
- Nicolas Moumdjian
