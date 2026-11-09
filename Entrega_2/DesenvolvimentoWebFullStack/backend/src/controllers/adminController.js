const pool = require('../config/db');

const checklistInicial = [
  { id: 'receita', titulo: 'Consulta Receita Federal', descricao: 'CNPJ ativo e situação cadastral regular.', status: 'pendente' },
  { id: 'cnd', titulo: 'Certidão Negativa de Débitos (CND)', descricao: 'Certidões fiscais e trabalhistas válidas.', status: 'pendente' },
  { id: 'contrato', titulo: 'Contrato Social e Última Alteração', descricao: 'Conferência dos documentos societários.', status: 'pendente' },
  { id: 'endereco', titulo: 'Comprovante de Endereço Operacional', descricao: 'Comprovante recente do endereço informado.', status: 'pendente' },
];

function parseJson(value, fallback) {
  if (!value) return fallback;
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function listPending(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.ID_USUARIO, u.NOME, u.EMAIL, u.PERFIL, u.CRIADO_EM, u.CHECKLIST_JSON,
              o.CNPJ AS CNPJ_ORG, o.TELEFONE AS TELEFONE_ORG,
              f.CNPJ AS CNPJ_FOR, f.CATEGORIA,
              d.ID_DOCUMENTO, d.NOME_ARQUIVO, OCTET_LENGTH(d.CONTEUDO) AS TAMANHO,
              d.CRIADO_EM AS DOCUMENTO_CRIADO_EM
         FROM USUARIOS u
         LEFT JOIN ORGANIZADORES o ON o.ID_USUARIO = u.ID_USUARIO
         LEFT JOIN FORNECEDORES f ON f.ID_USUARIO = u.ID_USUARIO
         LEFT JOIN DOCUMENTOS d ON d.ID_DOCUMENTO = (
           SELECT MAX(d2.ID_DOCUMENTO) FROM DOCUMENTOS d2 WHERE d2.ID_USUARIO = u.ID_USUARIO
         )
        WHERE u.STATUS_CADASTRO = 'PENDENTE'
        ORDER BY u.CRIADO_EM ASC`
    );
    const agora = Date.now();
    return res.json(rows.map((row) => {
      const criadoEm = new Date(row.CRIADO_EM);
      const tipo = row.PERFIL === 'ORGANIZADOR' ? 'Organizador' : 'Fornecedor';
      const cnpj = row.CNPJ_ORG || row.CNPJ_FOR || '';
      return {
        id: String(row.ID_USUARIO),
        nome: row.NOME,
        fantasia: row.NOME,
        cnpj,
        tipo,
        categoria: row.CATEGORIA || tipo,
        porte: 'Não informado',
        uf: '—',
        cidade: '—',
        submetidoEm: criadoEm.toISOString(),
        horasNaFila: Math.max(0, Math.floor((agora - criadoEm.getTime()) / 3_600_000)),
        ie: 'Não informado',
        responsavel: row.NOME,
        telefone: row.TELEFONE_ORG || 'Não informado',
        email: row.EMAIL,
        cnae: 'Não informado',
        endereco: 'Não informado',
        checklist: parseJson(row.CHECKLIST_JSON, checklistInicial),
        documentos: row.ID_DOCUMENTO ? [{
          id: String(row.ID_DOCUMENTO),
          usuarioId: String(row.ID_USUARIO),
          nome: row.NOME_ARQUIVO,
          tamanho: formatBytes(Number(row.TAMANHO)),
          info: 'Arquivo enviado no cadastro',
          url: null,
        }] : [],
      };
    }));
  } catch (err) {
    return next(err);
  }
}

async function updateChecklist(req, res, next) {
  const { id, itemId } = req.params;
  const { status } = req.body;
  if (!['valido', 'verificacao', 'pendente'].includes(status)) {
    return res.status(400).json({ erro: 'Status de checklist inválido.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT NOME, CHECKLIST_JSON FROM USUARIOS
        WHERE ID_USUARIO = ? AND STATUS_CADASTRO = 'PENDENTE' FOR UPDATE`,
      [id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ erro: 'Cadastro pendente não encontrado.' });
    }
    const checklist = parseJson(rows[0].CHECKLIST_JSON, checklistInicial);
    const item = checklist.find((entry) => entry.id === itemId);
    if (!item) {
      await connection.rollback();
      return res.status(404).json({ erro: 'Item de checklist não encontrado.' });
    }
    item.status = status;
    await connection.query(
      'UPDATE USUARIOS SET CHECKLIST_JSON = ? WHERE ID_USUARIO = ?',
      [JSON.stringify(checklist), id]
    );
    await connection.query(
      `INSERT INTO ADMIN_AUDITORIA (ID_ADMIN, ENTIDADE, ACAO, ALVO, JUSTIFICATIVA)
       VALUES (?, 'Aprovação', 'Checklist atualizado', ?, ?)`,
      [req.user.id, rows[0].NOME, `${item.titulo}: ${status}`]
    );
    await connection.commit();
    return res.json({ id: String(id), checklist });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        return next(rollbackError);
      }
    }
    return next(err);
  } finally {
    connection?.release();
  }
}

async function reviewRegistration(req, res, next) {
  const { id } = req.params;
  const approve = req.path.endsWith('/aprovar');
  const reason = String(approve ? req.body.observacao || '' : req.body.motivo || '').trim();
  if (!approve && (reason.length < 5 || reason.length > 2000)) {
    return res.status(400).json({ erro: 'Informe um motivo de rejeição com 5 a 2000 caracteres.' });
  }
  if (approve && reason.length > 2000) {
    return res.status(400).json({ erro: 'A observação aceita até 2000 caracteres.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT NOME, CHECKLIST_JSON FROM USUARIOS
        WHERE ID_USUARIO = ? AND STATUS_CADASTRO = 'PENDENTE' FOR UPDATE`,
      [id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ erro: 'Este cadastro já foi analisado ou não existe.' });
    }
    const checklist = parseJson(rows[0].CHECKLIST_JSON, checklistInicial);
    if (approve && checklist.some((entry) => entry.status !== 'valido')) {
      await connection.rollback();
      return res.status(400).json({ erro: 'Todos os itens do checklist precisam estar válidos para aprovar.' });
    }
    const status = approve ? 'APROVADO' : 'REPROVADO';
    const action = approve ? 'Aprovado' : 'Rejeitado';
    await connection.query(
      `UPDATE USUARIOS
          SET STATUS_CADASTRO = ?, MOTIVO_REPROVACAO = ?, APROVADO_EM = ?
        WHERE ID_USUARIO = ?`,
      [status, approve ? null : reason, approve ? new Date() : null, id]
    );
    await connection.query(
      `INSERT INTO ADMIN_AUDITORIA (ID_ADMIN, ENTIDADE, ACAO, ALVO, JUSTIFICATIVA)
       VALUES (?, 'Aprovação', ?, ?, ?)`,
      [req.user.id, action, rows[0].NOME, reason || 'Documentação validada.']
    );
    await connection.commit();
    return res.json({ id: String(id), nome: rows[0].NOME, status: status.toLowerCase() });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        return next(rollbackError);
      }
    }
    return next(err);
  } finally {
    connection?.release();
  }
}

async function listRegistrations(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.ID_USUARIO, u.NOME, u.EMAIL, u.PERFIL, u.STATUS_CADASTRO,
              u.APROVADO_EM, u.CRIADO_EM, o.CNPJ AS CNPJ_ORG,
              o.TELEFONE AS TELEFONE_ORG, f.CNPJ AS CNPJ_FOR, f.CATEGORIA AS CATEGORIA_FOR,
              (SELECT COUNT(*) FROM EVENTOS e WHERE e.ID_ORGANIZADOR = o.ID_ORGANIZADOR) AS EVENTOS
         FROM USUARIOS u
         LEFT JOIN ORGANIZADORES o ON o.ID_USUARIO = u.ID_USUARIO
         LEFT JOIN FORNECEDORES f ON f.ID_USUARIO = u.ID_USUARIO
        WHERE u.STATUS_CADASTRO IN ('APROVADO', 'SUSPENSO')
        ORDER BY COALESCE(u.APROVADO_EM, u.CRIADO_EM) DESC`
    );
    return res.json(rows.map((row) => ({
      id: String(row.ID_USUARIO),
      nome: row.NOME,
      razao: row.NOME,
      cnpj: row.CNPJ_ORG || row.CNPJ_FOR || '',
      tipo: row.PERFIL === 'ORGANIZADOR' ? 'Organizador' : 'Fornecedor',
      categoria: row.CATEGORIA_FOR || (row.PERFIL === 'ORGANIZADOR' ? 'Organização de eventos' : 'Não informada'),
      uf: '—',
      cidade: '—',
      aprovadoEm: new Date(row.APROVADO_EM || row.CRIADO_EM).toISOString().slice(0, 10),
      eventos: Number(row.EVENTOS) || 0,
      status: row.STATUS_CADASTRO === 'SUSPENSO' ? 'Suspenso' : 'Ativo',
      responsavel: row.NOME,
      email: row.EMAIL,
    })));
  } catch (err) {
    return next(err);
  }
}

async function changeRegistrationStatus(req, res, next) {
  const reason = String(req.body.motivo || '').trim();
  if (reason.length < 5 || reason.length > 2000) {
    return res.status(400).json({ erro: 'Informe uma justificativa com 5 a 2000 caracteres.' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT NOME, STATUS_CADASTRO FROM USUARIOS
        WHERE ID_USUARIO = ? AND STATUS_CADASTRO IN ('APROVADO', 'SUSPENSO') FOR UPDATE`,
      [req.params.id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ erro: 'Cadastro ativo ou suspenso não encontrado.' });
    }
    const status = rows[0].STATUS_CADASTRO === 'APROVADO' ? 'SUSPENSO' : 'APROVADO';
    await connection.query(
      'UPDATE USUARIOS SET STATUS_CADASTRO = ? WHERE ID_USUARIO = ?',
      [status, req.params.id]
    );
    await connection.query(
      `INSERT INTO ADMIN_AUDITORIA (ID_ADMIN, ENTIDADE, ACAO, ALVO, JUSTIFICATIVA)
       VALUES (?, 'Cadastro', ?, ?, ?)`,
      [req.user.id, status === 'SUSPENSO' ? 'Suspensão' : 'Reativação', rows[0].NOME, reason]
    );
    await connection.commit();
    return res.json({
      id: String(req.params.id),
      nome: rows[0].NOME,
      status: status === 'SUSPENSO' ? 'Suspenso' : 'Ativo',
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        return next(rollbackError);
      }
    }
    return next(err);
  } finally {
    connection?.release();
  }
}

async function downloadRegistrationDocument(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ID_DOCUMENTO, NOME_ARQUIVO, MIME_TYPE, CONTEUDO
         FROM DOCUMENTOS
        WHERE ID_DOCUMENTO = ? AND ID_USUARIO = ?`,
      [req.params.documentId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Documento não encontrado.' });
    return res.json({
      nome: rows[0].NOME_ARQUIVO,
      tipo: rows[0].MIME_TYPE,
      conteudo: rows[0].CONTEUDO.toString('base64'),
    });
  } catch (err) {
    return next(err);
  }
}

async function listAudit(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.ID_AUDITORIA, a.ENTIDADE, a.ACAO, a.ALVO, a.JUSTIFICATIVA, a.CRIADO_EM, u.NOME AS AUTOR
         FROM ADMIN_AUDITORIA a
         JOIN USUARIOS u ON u.ID_USUARIO = a.ID_ADMIN
        ORDER BY a.CRIADO_EM DESC LIMIT 500`
    );
    return res.json(rows.map((row) => ({
      id: String(row.ID_AUDITORIA),
      entidade: row.ENTIDADE,
      acao: row.ACAO,
      alvo: row.ALVO,
      justificativa: row.JUSTIFICATIVA || '',
      data: new Date(row.CRIADO_EM).toISOString(),
      autor: row.AUTOR,
    })));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPending,
  listRegistrations,
  changeRegistrationStatus,
  updateChecklist,
  reviewRegistration,
  downloadRegistrationDocument,
  listAudit,
};
