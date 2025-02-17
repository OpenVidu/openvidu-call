import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { register } from 'ts-node';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

register({
  transpileOnly: true,
  project: `${__dirname}/tsconfig.json`, // Ahora usa la ruta correcta
});

import glob from 'glob';

const testFiles = glob.sync(path.resolve('test/e2e/**/*.test.ts')); // Convertir a ruta absoluta
console.log('Tests encontrados:', testFiles); // Para depura

export default {
  extension: ['ts'],
  spec: testFiles,
  timeout: 30000,
  recursive: true,
  // Indicar que Mocha debe usar ESM
  loader: 'ts-node/esm',
  require: ['ts-node/register'],
};
