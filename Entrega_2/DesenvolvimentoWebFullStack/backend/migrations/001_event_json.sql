USE TROCATICKET;

ALTER TABLE EVENTOS
  MODIFY COLUMN NOME VARCHAR(100) NOT NULL;

SET @event_json_column_exists = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'EVENTOS'
     AND COLUMN_NAME = 'DADOS_JSON'
);
SET @event_json_migration = IF(
  @event_json_column_exists = 0,
  'ALTER TABLE EVENTOS ADD COLUMN DADOS_JSON JSON NULL',
  'SELECT 1'
);
PREPARE event_json_statement FROM @event_json_migration;
EXECUTE event_json_statement;
DEALLOCATE PREPARE event_json_statement;

ALTER TABLE USUARIOS
  MODIFY COLUMN NOME VARCHAR(120) NOT NULL;

CREATE TABLE IF NOT EXISTS DOCUMENTOS (
  ID_DOCUMENTO INT PRIMARY KEY AUTO_INCREMENT,
  ID_USUARIO INT NOT NULL,
  NOME_ARQUIVO VARCHAR(255) NOT NULL,
  MIME_TYPE VARCHAR(100) NOT NULL,
  CONTEUDO LONGBLOB NOT NULL,
  CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FKDocumentoUsuario FOREIGN KEY (ID_USUARIO) REFERENCES USUARIOS (ID_USUARIO)
);

UPDATE EVENTOS
   SET DADOS_JSON = JSON_OBJECT(
     'nome', NOME,
     'categoria', '',
     'descricao', '',
     'capa', '',
     'dataInicio', DATE_FORMAT(DATA_INICIO, '%Y-%m-%dT%H:%i'),
     'dataFim', DATE_FORMAT(DATA_FINAL, '%Y-%m-%dT%H:%i'),
     'local', JSON_OBJECT('nome', LOCALIZACAO, 'cidade', '', 'uf', ''),
     'capacidadeAlvara', PUBLICO_MAXIMO,
     'publico', JSON_OBJECT('minimo', PUBLICO_MINIMO, 'maximo', PUBLICO_MAXIMO),
     'precificacao', JSON_OBJECT(
       'margem', MARGEM_LUCRO,
       'taxaPlataforma', 0.08,
       'impostos', 0.05,
       'publicoEsperado', NULL,
       'cenarioEscolhido', 'esperado'
     ),
     'custos', JSON_OBJECT(
       'fornecedores', JSON_ARRAY(),
       'fiscais', JSON_ARRAY(),
       'propostasAceitas', JSON_ARRAY()
     ),
     'propostas', JSON_ARRAY(),
     'status', COALESCE(STATUS, 'planejamento'),
     'etapaAtual', 'cadastro'
   )
 WHERE DADOS_JSON IS NULL;
