# TrocaTicket — Back-end

## Como rodar
1. `npm install`
2. Copie `.env.example` para `.env` e preencha
3. Rode `database.sql` no MySQL (atenção: ele apaga e recria o banco TROCATICKET)
4. `npm run dev`

## Rotas
| Método | Rota | Proteção | Descrição |
|---|---|---|---|
| POST | /api/auth/register | pública | cadastro |
| POST | /api/auth/login | pública | login, retorna token JWT |
| GET | /api/auth/me | JWT | dados do usuário logado |

### POST /api/auth/register
Perfis aceitos: `ORGANIZADOR` ou `FORNECEDOR`.

Organizador:
```json
{ "nome": "Ana", "email": "ana@email.com", "senha": "123456",
  "perfil": "ORGANIZADOR", "cnpj": "12.345.678/0001-90", "telefone": "11999999999" }
```
Fornecedor:
```json
{ "nome": "Buffet X", "email": "buffet@email.com", "senha": "123456",
  "perfil": "FORNECEDOR", "cnpj": "98.765.432/0001-10",
  "categoria": "Alimentação", "descricao": "Buffet para eventos" }
```

### Rotas protegidas
Header `Authorization: Bearer <token>`.
Para restringir por perfil: `router.post('/', auth, autorizar('ORGANIZADOR'), handler)`.
