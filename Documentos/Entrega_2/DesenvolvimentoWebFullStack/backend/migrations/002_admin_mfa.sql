USE TROCATICKET;

SET @mfa_secret_column_exists = (
  SELECT COUNT(*)
    FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'USUARIOS'
     AND COLUMN_NAME = 'MFA_SECRET'
);
SET @mfa_secret_migration = IF(
  @mfa_secret_column_exists = 0,
  'ALTER TABLE USUARIOS ADD COLUMN MFA_SECRET VARCHAR(64) NULL',
  'SELECT 1'
);
PREPARE mfa_secret_statement FROM @mfa_secret_migration;
EXECUTE mfa_secret_statement;
DEALLOCATE PREPARE mfa_secret_statement;
