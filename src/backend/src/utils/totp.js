const crypto = require('crypto');

function decodeBase32(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = value.toUpperCase().replace(/[\s=-]/g, '');
  let bits = '';

  for (const character of normalized) {
    const index = alphabet.indexOf(character);
    if (index === -1) throw new Error('Segredo MFA inválido.');
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(parseInt(bits.slice(offset, offset + 8), 2));
  }
  if (bytes.length < 10) throw new Error('Segredo MFA inválido.');
  return Buffer.from(bytes);
}

function codeForCounter(secret, counter) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 1_000_000).padStart(6, '0');
}

function verifyTotp(secret, token, now = Date.now()) {
  if (typeof token !== 'string' || !/^\d{6}$/.test(token)) return false;
  const key = decodeBase32(secret);
  const counter = Math.floor(now / 30_000);
  const supplied = Buffer.from(token);

  for (let offset = -1; offset <= 1; offset += 1) {
    if (counter + offset < 0) continue;
    const expected = Buffer.from(codeForCounter(key, counter + offset));
    if (crypto.timingSafeEqual(expected, supplied)) return true;
  }
  return false;
}

module.exports = { verifyTotp };
