# TrocaTicket — Front-end (Entrega 1)

React + Vite + React Router.

## Como rodar

```bash
npm install
npm run dev
```

## Estrutura

- `src/components/` componentes reutilizáveis (Header, Footer, Layout, TextField, Button, OtpInput...)
- `src/components/admin/` componentes exclusivos do painel do administrador (Sidebar, Layout, Badge, StatCard, AdminPageHeader, AsyncState)
- `src/pages/` uma página por rota
- `src/pages/admin/` telas do painel do administrador (Visão Geral, Aprovações, Usuários, Eventos, Cotações, Relatórios e Auditoria)
- `src/services/` acesso à API (fetch e tratamento de erro)
- `src/context/` e `src/hooks/` sessão do usuário (AuthProvider, useAuth)
- `src/utils/` validadores e mapa de rotas
- `src/styles/` tokens (cores, tipografia, espaçamento) e estilos base
- `public/mock/usuarios.json` "API" mockada de usuários
- `src/utils/` validadores, mapa de rotas e helpers do painel admin (status, formatação)
- `src/styles/` tokens (cores, tipografia, espaçamento), estilos base e estilos compartilhados do painel admin
- `public/mock/` "API" mockada (usuários, aprovações, cadastros, eventos, cotações, relatórios)

## Painel do administrador (`/admin`)

Acessível após login em `/login-admin` (conta de teste abaixo). Rotas:

| Rota | Tela |
|---|---|
| `/admin` | Visão Geral |
| `/admin/aprovacoes` | Aprovações pendentes de cadastro (aprovar/rejeitar com motivo obrigatório) |
| `/admin/usuarios` | Usuários e Cadastros (suspender/reativar) |
| `/admin/eventos` | Eventos (filtros, exportar CSV) |
| `/admin/cotacoes` | Cotações em acompanhamento |
| `/admin/relatorios` | Relatórios gerenciais e Histórico de Auditoria |

Qualquer rota `/admin/*` inexistente cai na tela de 404 dentro do próprio layout do painel.

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
