const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { register, registrationStatus } = require('./authController');

const originalJwtSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = 'test-registration-status-secret';

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('register returns a scoped status token for the created user', async () => {
  const originalFindByEmail = User.findByEmail;
  const originalCreate = User.create;
  User.findByEmail = async () => null;
  User.create = async () => 42;

  try {
    const res = createResponse();
    await register({
      body: {
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'senha-segura',
        perfil: 'ORGANIZADOR',
        cnpj: '12345678000190',
        telefone: '11999999999',
      },
    }, res, (err) => {
      throw err;
    });

    assert.equal(res.statusCode, 201);
    const token = jwt.verify(res.body.statusToken, process.env.JWT_SECRET);
    assert.equal(token.sub, '42');
    assert.equal(token.purpose, 'registration_status');
  } finally {
    User.findByEmail = originalFindByEmail;
    User.create = originalCreate;
  }
});

test('registration status returns only the status and rejection reason for its scoped token', async () => {
  const originalFindRegistrationStatusById = User.findRegistrationStatusById;
  let queriedId;
  User.findRegistrationStatusById = async (id) => {
    queriedId = id;
    return { STATUS_CADASTRO: 'REPROVADO', MOTIVO_REPROVACAO: 'Documento ilegível.' };
  };

  try {
    const res = createResponse();
    const token = jwt.sign(
      { purpose: 'registration_status' },
      process.env.JWT_SECRET,
      { subject: '42', expiresIn: '1h' }
    );
    await registrationStatus({ headers: { authorization: `Bearer ${token}` } }, res, (err) => {
      throw err;
    });

    assert.equal(queriedId, '42');
    assert.deepEqual(res.body, { status: 'reprovado', motivo: 'Documento ilegível.' });
  } finally {
    User.findRegistrationStatusById = originalFindRegistrationStatusById;
  }
});

test('registration status rejects regular session tokens', async () => {
  const res = createResponse();
  const token = jwt.sign({ id: 42, perfil: 'ORGANIZADOR' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  await registrationStatus({ headers: { authorization: `Bearer ${token}` } }, res, (err) => {
    throw err;
  });

  assert.equal(res.statusCode, 403);
});

test('authentication routes load with the registration status handler', () => {
  assert.doesNotThrow(() => require('../routes/authRoutes'));
});

test.after(() => {
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});
