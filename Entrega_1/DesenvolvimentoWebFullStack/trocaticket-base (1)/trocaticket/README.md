# TrocaTicket — Front-end (Entrega 1)

React + Vite + React Router.

## Como rodar

```bash
npm install
npm run dev
```

## Estrutura

- `src/components/` componentes reutilizáveis (Header, Footer, Layout, TextField, Button, OtpInput...)
- `src/pages/` uma página por rota
- `src/services/` acesso à API (fetch e tratamento de erro)
- `src/context/` e `src/hooks/` sessão do usuário (AuthProvider, useAuth)
- `src/utils/` validadores e mapa de rotas
- `src/styles/` tokens (cores, tipografia, espaçamento) e estilos base
- `public/mock/usuarios.json` "API" mockada de usuários

## Contas de teste (dados mockados)

| Perfil | E-mail | Senha | MFA |
|---|---|---|---|
| Organizador | organizador@trocaticket.com.br | Troca@2026 | — |
| Fornecedor | fornecedor@trocaticket.com.br | Troca@2026 | — |
| Administrador (`/login-admin`) | gestao.auditoria@trocaticket.com.br | Admin@2026 | 123456 |

## Integrantes

- (preencher)
