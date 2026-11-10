# TrocaTicket — Back-end

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha.
3. Rode `database.sql` no MySQL (atenção: ele apaga e recria o banco TROCATICKET).
4. `npm run dev`

Para preservar uma base existente, faça backup e aplique, nesta ordem, `migrations/001_event_json.sql`, `migrations/002_admin_mfa.sql` e `migrations/003_cadastro_aprovacao.sql` no MySQL. As migrações podem ser executadas novamente. O script principal `database.sql` recria o banco e apaga os dados.

No desenvolvimento, o Vite encaminha `/api` para `http://localhost:3000`. Configure `VITE_API_PROXY_TARGET` no ambiente do Vite para outro endereço.

## Testes da API — Postman

A coleção de testes da API está disponível no arquivo:

`TrocaTicket_Postman_Collection.json`

A coleção utiliza o formato Postman Collection v2.1 e reúne os testes das principais funcionalidades implementadas no back-end.

### Como importar a coleção

1. Abra o Postman.
2. Acesse **Collections**.
3. Clique em **Import**.
4. Selecione o arquivo `TrocaTicket_Postman_Collection.json`.
5. Confirme a importação.

### Configuração

Antes de executar os testes, inicie o back-end e configure as variáveis da coleção:

| **Variável** | **Valor** | **Descrição** |
| --- | --- | --- |
| `base_url` | `http://localhost:3000` | Endereço da API |
| `token` | Token JWT | Autenticação do usuário |
| `status_token` | Token de acompanhamento | Consulta do status do cadastro |
| `user_id` | ID do usuário | Identificação do cadastro |
| `admin_token` | Token JWT administrativo | Autenticação de administrador |

Os tokens devem ser obtidos durante os testes de autenticação. O acesso às rotas protegidas exige um token JWT válido, enviado no cabeçalho `Authorization: Bearer <token>`.

### Organização dos testes

A coleção está dividida em grupos:

**01 — Autenticação e usuários**
- Verificação de disponibilidade da API.
- Cadastro de organizador.
- Cadastro de fornecedor.
- Login.
- Bloqueio de login antes da aprovação.
- Consulta dos dados do usuário autenticado.
- Consulta do documento enviado.
- Consulta do status do cadastro.
- Autenticação administrativa com MFA.

**02 — Eventos**
- Listagem de eventos do organizador.
- Criação de evento.
- Atualização de evento próprio.

**03 — Administração**
- Listagem de cadastros pendentes.
- Consulta de cadastros aprovados e suspensos.
- Atualização do checklist documental.
- Aprovação de cadastro.
- Rejeição de cadastro com justificativa.
- Consulta de documentos enviados.
- Suspensão de cadastro.
- Reativação de cadastro.
- Consulta do histórico de auditoria.

**Observação:** os testes administrativos exigem uma conta ADMIN previamente cadastrada no banco de dados e configurada com MFA. Os testes que dependem de cadastros devem respeitar o fluxo de aprovação.

## Rotas

| **Método** | **Rota** | **Proteção** | **Descrição** |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | pública | cadastro |
| POST | `/api/auth/login` | pública | login, retorna token JWT |
| GET | `/api/auth/me` | JWT | dados do usuário logado |
| GET | `/api/auth/me/documento` | JWT | documento enviado pelo usuário logado |
| GET | `/api/auth/registration-status` | token de acompanhamento | status público do próprio cadastro |
| GET | `/api/health` | pública | disponibilidade da API |
| GET | `/api/eventos` | JWT (ORGANIZADOR) | eventos do organizador autenticado |
| POST | `/api/eventos` | JWT (ORGANIZADOR) | cria um evento |
| PUT | `/api/eventos/:id` | JWT (ORGANIZADOR) | atualiza um evento próprio |
| GET | `/api/admin/aprovacoes` | JWT (ADMIN) | fila de cadastros pendentes |
| GET | `/api/admin/cadastros` | JWT (ADMIN) | cadastros aprovados/suspensos |
| PATCH | `/api/admin/cadastros/:id/status` | JWT (ADMIN) | suspende ou reativa cadastro com justificativa |
| PUT | `/api/admin/aprovacoes/:id/checklist/:itemId` | JWT (ADMIN) | atualiza checagem documental |
| POST | `/api/admin/aprovacoes/:id/aprovar` | JWT (ADMIN) | aprova após checklist válido |
| POST | `/api/admin/aprovacoes/:id/rejeitar` | JWT (ADMIN) | rejeita e grava o motivo |
| GET | `/api/admin/aprovacoes/:id/documentos/:documentId` | JWT (ADMIN) | documento enviado para análise |
| GET | `/api/admin/auditoria` | JWT (ADMIN) | histórico de decisões administrativas |

### POST /api/auth/register

Perfis aceitos: `ORGANIZADOR` ou `FORNECEDOR`.

O formulário pode enviar `documento: { nome, tipo, conteudo }`, com `conteudo` em base64 e arquivo PDF/JPG/PNG de até 10 MB.

O arquivo fica armazenado na tabela `DOCUMENTOS` dentro da transação do cadastro. Novos cadastros começam como `PENDENTE`; o endpoint retorna `statusToken`, usado somente para consultar o próprio status sem autenticar uma sessão completa. A conta só pode entrar após aprovação.

O envio de e-mails ainda não está configurado. A decisão de aprovação/rejeição e o motivo ficam persistidos e podem ser consultados na página de acompanhamento.

**Organizador:**

```json
{
  "nome": "Ana",
  "email": "ana@email.com",
  "senha": "123456",
  "perfil": "ORGANIZADOR",
  "cnpj": "12.345.678/0001-90",
  "telefone": "11999999999"
}
```

**Fornecedor:**

```json
{
  "nome": "Buffet X",
  "email": "buffet@email.com",
  "senha": "123456",
  "perfil": "FORNECEDOR",
  "cnpj": "98.765.432/0001-10",
  "categoria": "Alimentação",
  "descricao": "Buffet para eventos"
}
```

### Rotas protegidas

Header `Authorization: Bearer <token>`.

Para restringir por perfil:

```javascript
router.post('/', auth, autorizar('ORGANIZADOR'), handler);
```

### Acesso administrativo

Administradores não podem se cadastrar pelo endpoint público.

Crie cada conta manualmente em `USUARIOS`, com `PERFIL = 'ADMIN'`, hash bcrypt na coluna `SENHA` e um segredo TOTP Base32 aleatório de pelo menos 16 bytes na coluna `MFA_SECRET`.

Segredos sem provisionamento bloqueiam o login; não use um segredo padrão ou compartilhado.

O formulário administrativo envia e-mail, senha, `admin: true` e o código de seis dígitos em `mfa` para `/api/auth/login`; contas administrativas sem o indicador e demais contas nesse fluxo são recusadas.

Gere a senha com bcrypt e o segredo TOTP com um gerador Base32 confiável, em ambiente local protegido. Guarde o segredo no autenticador TOTP do administrador e não o publique.

Nunca insira senhas em texto puro nem use valores padrão compartilhados.
