const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyTotp } = require('./totp');

test('verifies the RFC 6238 SHA-1 test vector as a six-digit code', () => {
  assert.equal(verifyTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '287082', 59_000), true);
});

test('rejects malformed or expired-window codes', () => {
  assert.equal(verifyTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '12345', 59_000), false);
  assert.equal(verifyTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', '287082', 180_000), false);
});

test('rejects malformed secrets explicitly', () => {
  assert.throws(() => verifyTotp('not-a-valid-key!', '123456', 59_000), /Segredo MFA inválido/);
});
