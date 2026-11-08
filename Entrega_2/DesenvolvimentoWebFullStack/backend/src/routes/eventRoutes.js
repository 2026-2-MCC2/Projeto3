const express = require('express');
const { auth, autorizar } = require('../middlewares/auth');
const { list, create, update } = require('../controllers/eventController');

const router = express.Router();
router.use(auth, autorizar('ORGANIZADOR'));
router.get('/', list);
router.post('/', create);
router.put('/:id', update);

module.exports = router;
