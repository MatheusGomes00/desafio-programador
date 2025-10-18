import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function prompt(texto) {
    return new Promise((resolve) => {
        rl.question(texto, (valor) => {
            resolve(valor);
        });
    });
}

export function fecharReadLine() {
    rl.close();
    return;
}