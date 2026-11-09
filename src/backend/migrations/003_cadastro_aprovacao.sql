USE TROCATICKET;

SET @status_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'STATUS_CADASTRO'
);
SET @status_migration = IF(
  @status_column_exists = 0,
  'ALTER TABLE USUARIOS ADD COLUMN STATUS_CADASTRO VARCHAR(20) NOT NULL DEFAULT ''APROVADO''',
  'SELECT 1'
);
PREPARE status_statement FROM @status_migration;
EXECUTE status_statement;
DEALLOCATE PREPARE status_statement;

SET @rejection_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'MOTIVO_REPROVACAO'
);
SET @rejection_migration = IF(
  @rejection_column_exists = 0,
  'ALTER TABLE USUARIOS ADD COLUMN MOTIVO_REPROVACAO TEXT NULL',
  'SELECT 1'
);
PREPARE rejection_statement FROM @rejection_migration;
EXECUTE rejection_statement;
DEALLOCATE PREPARE rejection_statement;

SET @checklist_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'CHECKLIST_JSON'
);
SET @checklist_migration = IF(
  @checklist_column_exists = 0,
  'ALTER TABLE USUARIOS ADD COLUMN CHECKLIST_JSON JSON NULL',
  'SELECT 1'
);
PREPARE checklist_statement FROM @checklist_migration;
EXECUTE checklist_statement;
DEALLOCATE PREPARE checklist_statement;

SET @approved_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'APROVADO_EM'
);
SET @approved_migration = IF(
  @approved_column_exists = 0,
  'ALTER TABLE USUARIOS ADD COLUMN APROVADO_EM DATETIME NULL',
  'SELECT 1'
);
PREPARE approved_statement FROM @approved_migration;
EXECUTE approved_statement;
DEALLOCATE PREPARE approved_statement;

SET @created_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'CRIADO_EM'
);
SET @created_migration = IF(
  @created_column_exists = 0,
  'ALTER TABLE USUARIOS ADD COLUMN CRIADO_EM TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
  'SELECT 1'
);
PREPARE created_statement FROM @created_migration;
EXECUTE created_statement;
DEALLOCATE PREPARE created_statement;

CREATE TABLE IF NOT EXISTS ADMIN_AUDITORIA (
  ID_AUDITORIA INT PRIMARY KEY AUTO_INCREMENT,
  ID_ADMIN INT NOT NULL,
  ENTIDADE VARCHAR(50) NOT NULL,
  ACAO VARCHAR(50) NOT NULL,
  ALVO VARCHAR(255) NOT NULL,
  JUSTIFICATIVA TEXT,
  CRIADO_EM TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FKAuditoriaAdmin FOREIGN KEY (ID_ADMIN) REFERENCES USUARIOS (ID_USUARIO)
);
