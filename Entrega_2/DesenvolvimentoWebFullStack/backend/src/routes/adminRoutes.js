const express = require('express');
const { auth, autorizar } = require('../middlewares/auth');
const {
  listPending,
  listRegistrations,
  listEvents,
  changeRegistrationStatus,
  updateChecklist,
  reviewRegistration,
  downloadRegistrationDocument,
  listAudit,
} = require('../controllers/adminController');

const router = express.Router();
router.use(auth, autorizar('ADMIN'));
router.get('/aprovacoes', listPending);
router.get('/cadastros', listRegistrations);
router.get('/eventos', listEvents);
router.patch('/cadastros/:id/status', changeRegistrationStatus);
router.put('/aprovacoes/:id/checklist/:itemId', updateChecklist);
router.get('/aprovacoes/:id/documentos/:documentId', downloadRegistrationDocument);
router.post('/aprovacoes/:id/aprovar', (req, res, next) => reviewRegistration(req, res, next));
router.post('/aprovacoes/:id/rejeitar', (req, res, next) => reviewRegistration(req, res, next));
router.get('/auditoria', listAudit);

module.exports = router;
