const bcrypt = require('bcrypt');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function gerarBase32(bytes) {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }

  let resultado = '';

  for (let i = 0; i < bits.length; i += 5) {
    const grupo = bits.slice(i, i + 5).padEnd(5, '0');
    resultado += alfabeto[parseInt(grupo, 2)];
  }

  return resultado;
}

rl.question('Digite a senha do administrador: ', async (senha) => {
  try {
    if (senha.length < 8) {
      throw new Error('Use uma senha com pelo menos 8 caracteres.');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const segredoMFA = gerarBase32(
      crypto.randomBytes(20)
    );

    console.log('\nHASH BCRYPT:');
    console.log(senhaHash);

    console.log('\nSEGREDO MFA (GUARDE EM LOCAL SEGURO):');
    console.log(segredoMFA);

  } catch (erro) {
    console.error(erro.message);
  } finally {
    rl.close();
  }
});