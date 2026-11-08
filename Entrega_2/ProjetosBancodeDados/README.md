# Banco de Dados — TrocaTicket

## 1. Introdução

O banco de dados do TrocaTicket foi desenvolvido em MySQL para armazenar e relacionar as informações necessárias ao funcionamento da plataforma. A estrutura contempla usuários, organizadores, fornecedores, documentos, auditoria administrativa, eventos, itens, custos, propostas comerciais e seleções de propostas.

A modelagem utiliza chaves primárias (PK), chaves estrangeiras (FK), restrições de unicidade e validações de integridade para organizar os dados e reduzir inconsistências.

## 2. Tecnologias e recursos

- **SGBD:** MySQL 8.0.16 ou superior.
- **Ferramenta de gerenciamento:** MySQL Workbench.
- **Codificação:** UTF-8 (`utf8mb4`).
- **Dados estruturados complementares:** JSON.
- **Armazenamento de arquivos:** LONGBLOB.
- **Valores monetários:** DECIMAL(12,2).

As restrições `CHECK` são efetivamente aplicadas a partir do MySQL 8.0.16.

## 3. Estrutura do banco de dados

O banco `TROCATICKET` possui dez tabelas:

1. `USUARIOS`
2. `ORGANIZADORES`
3. `FORNECEDORES`
4. `DOCUMENTOS`
5. `ADMIN_AUDITORIA`
6. `EVENTOS`
7. `ITENS`
8. `CUSTOS`
9. `PROPOSTAS`
10. `SELECOES`



### 3.1 Cardinalidades

| Relacionamento | Cardinalidade | Regra representada |
|---|---|---|
| USUARIOS — ORGANIZADORES | 1 : 0..1 | Um usuário pode ter nenhum ou um cadastro de organizador. |
| USUARIOS — FORNECEDORES | 1 : 0..1 | Um usuário pode ter nenhum ou um cadastro de fornecedor. |
| USUARIOS — DOCUMENTOS | 1 : N | Um usuário pode enviar vários documentos. |
| USUARIOS — ADMIN_AUDITORIA | 1 : N | Um usuário administrador pode realizar vários registros de auditoria. |
| ORGANIZADORES — EVENTOS | 1 : N | Um organizador pode cadastrar vários eventos. |
| EVENTOS — ITENS | 1 : N | Um evento pode possuir vários itens. |
| EVENTOS — CUSTOS | 1 : N | Um evento pode possuir vários registros de custos. |
| EVENTOS — PROPOSTAS | 1 : N | Um evento pode receber várias propostas. |
| FORNECEDORES — PROPOSTAS | 1 : N | Um fornecedor pode enviar várias propostas. |
| PROPOSTAS — SELECOES | 1 : 0..1 | Uma proposta pode não ter sido selecionada ou possuir um registro de seleção. |

As cardinalidades `1 : 0..1` são implementadas com chave estrangeira `NOT NULL` e restrição `UNIQUE` na tabela dependente. As cardinalidades `1 : N` são implementadas por meio de chaves estrangeiras na tabela do lado N.

## 4. Dicionário de dados

### 4.1 USUARIOS

Armazena os dados de identificação, autenticação e situação cadastral dos usuários da plataforma.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_USUARIO | INT | PK, AUTO_INCREMENT. |
| NOME | VARCHAR(120) | NOT NULL; nome do usuário. |
| EMAIL | VARCHAR(254) | NOT NULL, UNIQUE; e-mail de acesso. |
| SENHA | VARCHAR(255) | NOT NULL; armazenar hash, nunca senha em texto puro. |
| PERFIL | VARCHAR(50) | NOT NULL; perfil de acesso. |
| MFA_SECRET | VARCHAR(64) | NULL; segredo de autenticação multifator. |
| STATUS_CADASTRO | VARCHAR(20) | NOT NULL; padrão APROVADO. |
| MOTIVO_REPROVACAO | TEXT | NULL; justificativa de reprovação. |
| CHECKLIST_JSON | JSON | NULL; dados complementares do cadastro. |
| APROVADO_EM | DATETIME | NULL; data e hora da aprovação. |
| CRIADO_EM | TIMESTAMP | NOT NULL; padrão CURRENT_TIMESTAMP. |

### 4.2 ORGANIZADORES

Armazena os dados empresariais e de contato dos organizadores. `ID_USUARIO` é FK e UNIQUE, garantindo no máximo um cadastro de organizador por usuário.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_ORGANIZADOR | INT | PK, AUTO_INCREMENT. |
| ID_USUARIO | INT | FK, NOT NULL, UNIQUE; referência a USUARIOS. |
| CNPJ | VARCHAR(18) | NOT NULL, UNIQUE. |
| TELEFONE | VARCHAR(20) | NOT NULL. |

### 4.3 FORNECEDORES

Armazena os dados cadastrais e a categoria de atuação dos fornecedores. `ID_USUARIO` é FK e UNIQUE, garantindo no máximo um cadastro de fornecedor por usuário.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_FORNECEDOR | INT | PK, AUTO_INCREMENT. |
| ID_USUARIO | INT | FK, NOT NULL, UNIQUE; referência a USUARIOS. |
| CNPJ | VARCHAR(18) | NOT NULL, UNIQUE. |
| CATEGORIA | VARCHAR(50) | NULL; categoria de atuação. |
| DESCRICAO | TEXT | NULL; descrição dos serviços ou produtos. |

### 4.4 DOCUMENTOS

Armazena arquivos enviados pelos usuários e seus metadados.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_DOCUMENTO | INT | PK, AUTO_INCREMENT. |
| ID_USUARIO | INT | FK, NOT NULL; referência a USUARIOS. |
| NOME_ARQUIVO | VARCHAR(255) | NOT NULL. |
| MIME_TYPE | VARCHAR(100) | NOT NULL; tipo de conteúdo. |
| CONTEUDO | LONGBLOB | NOT NULL; conteúdo binário. |
| CRIADO_EM | TIMESTAMP | Padrão CURRENT_TIMESTAMP. |

### 4.5 ADMIN_AUDITORIA

Registra ações administrativas para fins de rastreabilidade.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_AUDITORIA | INT | PK, AUTO_INCREMENT. |
| ID_ADMIN | INT | FK, NOT NULL; referência a USUARIOS. |
| ENTIDADE | VARCHAR(50) | NOT NULL; entidade afetada. |
| ACAO | VARCHAR(50) | NOT NULL; operação realizada. |
| ALVO | VARCHAR(255) | NOT NULL; identificação do alvo. |
| JUSTIFICATIVA | TEXT | NULL. |
| CRIADO_EM | TIMESTAMP | NOT NULL; padrão CURRENT_TIMESTAMP. |

A FK garante que o administrador registrado exista como usuário. A aplicação também deve validar se seu perfil possui permissão administrativa.

### 4.6 EVENTOS

Armazena os eventos cadastrados pelos organizadores, incluindo período, localização, público previsto e margem de lucro.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_EVENTO | INT | PK, AUTO_INCREMENT. |
| ID_ORGANIZADOR | INT | FK, NOT NULL; referência a ORGANIZADORES. |
| NOME | VARCHAR(100) | NOT NULL. |
| LOCALIZACAO | VARCHAR(255) | NOT NULL. |
| DATA_INICIO | DATETIME | NOT NULL. |
| DATA_FINAL | DATETIME | NOT NULL; deve ser igual ou posterior ao início. |
| PUBLICO_MINIMO | INT | NOT NULL; não pode ser negativo nem superar o máximo. |
| PUBLICO_MAXIMO | INT | NOT NULL; deve ser igual ou superior ao mínimo. |
| MARGEM_LUCRO | DECIMAL(5,2) | NOT NULL; margem percentual não negativa. |
| STATUS | VARCHAR(50) | NULL; situação do evento. |
| DADOS_JSON | JSON | NULL; informações complementares. |

### 4.7 ITENS

Armazena os itens necessários para a realização dos eventos.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_ITEM | INT | PK, AUTO_INCREMENT. |
| ID_EVENTO | INT | FK, NOT NULL; referência a EVENTOS. |
| NOME | VARCHAR(50) | NOT NULL. |
| CATEGORIA | VARCHAR(50) | NOT NULL. |
| QUANTIDADE | INT | NOT NULL; deve ser maior que zero. |

### 4.8 CUSTOS

Armazena os custos associados a cada evento.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_CUSTO | INT | PK, AUTO_INCREMENT. |
| ID_EVENTO | INT | FK, NOT NULL; referência a EVENTOS. |
| DESCRICAO | VARCHAR(255) | NULL. |
| CATEGORIA | VARCHAR(50) | NOT NULL. |
| VALOR | DECIMAL(12,2) | NOT NULL; valor não negativo. |

### 4.9 PROPOSTAS

Armazena propostas comerciais enviadas por fornecedores para eventos específicos. A inclusão de `ID_EVENTO` permite identificar a qual evento cada proposta está vinculada.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_PROPOSTA | INT | PK, AUTO_INCREMENT. |
| ID_FORNECEDOR | INT | FK, NOT NULL; referência a FORNECEDORES. |
| ID_EVENTO | INT | FK, NOT NULL; referência a EVENTOS. |
| VALOR | DECIMAL(12,2) | NOT NULL; valor não negativo. |
| DESCRICAO | TEXT | NULL; detalhes da proposta. |
| VALIDADE | DATE | NOT NULL; data limite de validade. |
| SITUACAO | VARCHAR(50) | NOT NULL; situação da proposta. |

### 4.10 SELECOES

Registra a seleção de propostas. A restrição UNIQUE em `ID_PROPOSTA` impede que a mesma proposta tenha mais de um registro de seleção.

| Campo | Tipo | Restrição / finalidade |
|---|---|---|
| ID_SELECAO | INT | PK, AUTO_INCREMENT. |
| ID_PROPOSTA | INT | FK, NOT NULL, UNIQUE; referência a PROPOSTAS. |
| DATA_SELECAO | DATETIME | NOT NULL; padrão CURRENT_TIMESTAMP. |

## 5. Regras de integridade

O script aplica as seguintes regras:

- **Identificação:** cada tabela possui uma chave primária.
- **Referência:** as chaves estrangeiras impedem referências a registros inexistentes.
- **Unicidade:** e-mails, CNPJs e vínculos individuais de organizadores, fornecedores e seleções possuem restrições UNIQUE.
- **Obrigatoriedade:** relacionamentos essenciais utilizam NOT NULL.
- **Validação:** restrições CHECK validam datas dos eventos, quantidade de público, quantidade de itens e valores financeiros.
- **Preservação:** as FKs utilizam ON DELETE RESTRICT para impedir a exclusão de registros que ainda possuam dependências.
- **Atualização:** ON UPDATE CASCADE propaga alterações de identificadores referenciados.

## 6. Observações de implementação

1. A aplicação deve armazenar em `SENHA` somente hashes seguros de senha.
2. A aplicação deve validar se o usuário associado a `ADMIN_AUDITORIA` realmente possui perfil administrativo. A FK, isoladamente, apenas confirma que o usuário existe.
3. O campo `MARGEM_LUCRO` representa uma porcentagem. A aplicação deve manter uma convenção única, por exemplo, `20.00` para 20%.
4. O campo `CNPJ` aceita valores com ou sem pontuação, desde que respeite o limite de 18 caracteres. A aplicação deve normalizar e validar o documento.
5. O campo `MFA_SECRET` deve ser protegido, pois contém informação sensível de autenticação.
6. A regra de que uma proposta pertence a um único evento está representada por `ID_EVENTO` em `PROPOSTAS`.
7. A regra de que uma proposta pode ser selecionada no máximo uma vez está representada por UNIQUE em `SELECOES.ID_PROPOSTA`.

## 7. Execução do script

O arquivo `Script SQL.sql` contém a criação do banco e das dez tabelas.

**Para executar no MySQL Workbench:**

1. Abra o MySQL Workbench e conecte-se ao servidor.
2. Abra o arquivo `Script SQL.sql`.
3. Confira se a linha `DROP DATABASE IF EXISTS TROCATICKET` permanece comentada.
4. Execute o script.
5. Atualize a área Schemas e verifique a criação do banco `TROCATICKET` e das dez tabelas.

> **Atenção:** se for necessário recriar o banco do zero, descomente a instrução `DROP DATABASE`. Isso apagará todos os dados existentes no banco.

## 8. Organização dos arquivos

```text
Entrega 2/
└── ProjetoBancodeDados/
    ├── README.md
    ├── Script SQL.sql
    ├── Modelo Conceitual.pdf
    └── Modelo Lógico.pdf
```

## 9. Considerações finais

A estrutura do banco de dados foi organizada para sustentar as principais funcionalidades do TrocaTicket, relacionando usuários, organizadores, fornecedores, eventos, custos e propostas comerciais.

A modelagem e a implementação devem permanecer sincronizadas: qualquer alteração nas entidades, atributos ou relacionamentos deve ser refletida no diagrama, no script SQL e nesta documentação.
