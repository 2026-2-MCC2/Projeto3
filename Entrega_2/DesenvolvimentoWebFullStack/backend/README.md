# TrocaTicket — Back-end

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha as variáveis de ambiente.
3. Rode `database.sql` no MySQL (atenção: ele apaga e recria o banco `TROCATICKET`).
4. `npm run dev`

Para preservar uma base existente, faça backup e aplique, nesta ordem, `migrations/001_event_json.sql`, `migrations/002_admin_mfa.sql` e `migrations/003_cadastro_aprovacao.sql` no MySQL. As migrações podem ser executadas novamente. O script principal `database.sql` recria o banco e apaga os dados.

No desenvolvimento, o Vite encaminha `/api` para `http://localhost:3000`. Configure `VITE_API_PROXY_TARGET` no ambiente do Vite para utilizar outro endereço.

## Rotas

| **Método** | **Rota** | **Proteção** | **Descrição** |
| ---------- | -------- | ------------ | ------------- |
| POST | /api/auth/register | pública | cadastro de organizadores e fornecedores |
| POST | /api/auth/login | pública | autenticação e geração de token JWT |
| GET | /api/auth/me | JWT | consulta os dados do usuário autenticado |
| GET | /api/auth/me/documento | JWT | consulta o documento enviado pelo usuário autenticado |
| GET | /api/auth/registration-status | token de acompanhamento | consulta o status do próprio cadastro |
| GET | /api/health | pública | verifica a disponibilidade da API |
| GET | /api/eventos | JWT (ORGANIZADOR) | lista os eventos do organizador autenticado |
| POST | /api/eventos | JWT (ORGANIZADOR) | cadastra um novo evento |
| PUT | /api/eventos/:id | JWT (ORGANIZADOR) | atualiza um evento próprio |
| GET | /api/admin/aprovacoes | JWT (ADMIN) | lista os cadastros pendentes para análise |
| GET | /api/admin/cadastros | JWT (ADMIN) | lista os cadastros aprovados e suspensos |
| PATCH | /api/admin/cadastros/:id/status | JWT (ADMIN) | suspende ou reativa um cadastro com justificativa |
| PUT | /api/admin/aprovacoes/:id/checklist/:itemId | JWT (ADMIN) | atualiza o status de um item do checklist documental |
| POST | /api/admin/aprovacoes/:id/aprovar | JWT (ADMIN) | aprova um cadastro após validação do checklist |
| POST | /api/admin/aprovacoes/:id/rejeitar | JWT (ADMIN) | rejeita um cadastro e registra o motivo |
| GET | /api/admin/aprovacoes/:id/documentos/:documentId | JWT (ADMIN) | consulta o documento enviado para análise |
| GET | /api/admin/auditoria | JWT (ADMIN) | consulta o histórico de ações administrativas |

### POST /api/auth/register

Perfis aceitos: `ORGANIZADOR` ou `FORNECEDOR`.

O cadastro recebe os dados do usuário e as informações específicas de cada perfil. O formulário também pode enviar um documento no formato `documento: { nome, tipo, conteudo }`, com `conteudo` codificado em Base64.

São aceitos arquivos PDF, JPG e PNG de até 10 MB. O documento é armazenado na tabela `DOCUMENTOS`, dentro da transação de cadastro.

Novos cadastros começam com o status `PENDENTE` e precisam passar pela análise administrativa antes de acessar as funcionalidades protegidas da conta.

O endpoint retorna um `statusToken`, utilizado exclusivamente para acompanhar o próprio cadastro.

O envio de e-mails ainda não está configurado. A decisão administrativa, o status e o motivo da reprovação ficam persistidos no banco de dados.

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

**Exemplo de envio de documento:**

```json
{
  "documento": {
    "nome": "documento.pdf",
    "tipo": "application/pdf",
    "conteudo": "BASE64_DO_ARQUIVO"
  }
}
```

O campo `conteudo` deve conter somente a sequência Base64, sem o prefixo `data:application/pdf;base64,`.

### Rotas protegidas

As rotas autenticadas utilizam o header:

```http
Authorization: Bearer <token>
```

O token JWT é obtido após o login e identifica o usuário autenticado.

Para restringir o acesso por perfil, utilize o middleware de autenticação e autorização. Exemplo:

```javascript
router.post('/', auth, autorizar('ORGANIZADOR'), handler);
```

As rotas administrativas exigem autenticação e perfil `ADMIN`.

### Acesso administrativo

Administradores não podem se cadastrar pelo endpoint público. Cada conta administrativa deve ser criada manualmente na tabela `USUARIOS`, com:

- `PERFIL = 'ADMIN'`;
- senha armazenada como hash bcrypt na coluna `SENHA`;
- segredo TOTP individual e aleatório na coluna `MFA_SECRET`.

O segredo TOTP deve ser Base32, gerado de forma segura, com pelo menos 16 bytes de aleatoriedade. Ele deve ser cadastrado no aplicativo autenticador utilizado pelo administrador.

O login administrativo envia e-mail, senha, `admin: true` e o código de seis dígitos em `mfa` para `/api/auth/login`.

O acesso administrativo utiliza autenticação multifator (MFA), além da validação das credenciais e do perfil do usuário.

Nunca armazene senhas em texto puro, utilize segredos padrão ou compartilhe chaves TOTP.

### Gestão de aprovações

A área administrativa permite consultar os cadastros pendentes, analisar documentos e atualizar o checklist de verificação.

Os quatro itens disponíveis são:

| **Identificador** | **Verificação** |
| ----------------- | --------------- |
| `receita` | Consulta Receita Federal |
| `cnd` | Certidão Negativa de Débitos |
| `contrato` | Contrato Social e Última Alteração |
| `endereco` | Comprovante de Endereço Operacional |

Para atualizar um item:

```http
PUT /api/admin/aprovacoes/:id/checklist/:itemId
```

Exemplo de corpo da requisição:

```json
{
  "status": "valido"
}
```

Os status aceitos são `valido`, `verificacao` e `pendente`.

A aprovação somente é permitida quando todos os itens do checklist estiverem com o status `valido`.

**Aprovação:**

```http
POST /api/admin/aprovacoes/:id/aprovar
```

**Reprovação:**

```http
POST /api/admin/aprovacoes/:id/rejeitar
```

Exemplo de corpo para reprovação:

```json
{
  "motivo": "Documentação cadastral incompleta para aprovação."
}
```

O motivo deve conter entre 5 e 2.000 caracteres.

### Suspensão e reativação de cadastros

A administração permite suspender cadastros aprovados e reativar cadastros suspensos.

A operação utiliza a seguinte rota:

```http
PATCH /api/admin/cadastros/:id/status
```

Exemplo de corpo da requisição:

```json
{
  "motivo": "Suspensão temporária para análise administrativa."
}
```

A mesma rota alterna automaticamente o status entre `APROVADO` e `SUSPENSO`, conforme o estado atual do cadastro.

Toda alteração exige uma justificativa de 5 a 2.000 caracteres e é registrada no histórico de auditoria.

### Auditoria administrativa

A API disponibiliza o histórico de ações realizadas pelos administradores:

```http
GET /api/admin/auditoria
```

O histórico registra informações como:

- Identificação da entidade afetada;
- Tipo de ação executada;
- Cadastro ou usuário relacionado;
- Justificativa da operação;
- Data e horário da ação;
- Administrador responsável.

As ações de checklist, aprovação, reprovação, suspensão e reativação são registradas na tabela `ADMIN_AUDITORIA`.

### Eventos

Os organizadores autenticados podem cadastrar, consultar e atualizar seus próprios eventos.

**Listagem:**

```http
GET /api/eventos
```

**Cadastro:**

```http
POST /api/eventos
```

**Atualização:**

```http
PUT /api/eventos/:id
```

As operações são protegidas por JWT e exigem o perfil `ORGANIZADOR`.

### Banco de dados

O projeto utiliza MySQL para armazenar os dados da aplicação.

Entre as principais tabelas estão:

- `USUARIOS`: dados de acesso, perfil e situação cadastral;
- `ORGANIZADORES`: informações específicas dos organizadores;
- `FORNECEDORES`: informações específicas dos fornecedores;
- `DOCUMENTOS`: arquivos enviados durante o cadastro;
- `ADMIN_AUDITORIA`: histórico das ações administrativas;
- `EVENTOS`: informações dos eventos cadastrados;
- `ITENS`: itens relacionados aos eventos;
- `CUSTOS`: informações financeiras dos eventos;
- `PROPOSTAS`: propostas relacionadas aos fornecedores e eventos;
- `SELECOES`: registros de seleção de propostas.

As operações de cadastro e análise administrativa utilizam transações para manter a integridade dos dados.

### Testes realizados

As seguintes funcionalidades foram verificadas durante os testes da API:

- Cadastro de organizadores e fornecedores;
- Login e autenticação JWT;
- Autenticação multifator do administrador;
- Consulta dos dados do usuário autenticado;
- Consulta de documentos cadastrados;
- Acompanhamento do status cadastral;
- Cadastro, listagem e atualização de eventos;
- Listagem de cadastros pendentes;
- Consulta de documentos para análise administrativa;
- Atualização dos quatro itens do checklist;
- Aprovação de fornecedores;
- Reprovação de cadastros com justificativa;
- Suspensão e reativação de cadastros;
- Persistência das alterações no MySQL;
- Registro e consulta do histórico de auditoria.
