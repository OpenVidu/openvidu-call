import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the source code
const srcPath = path.resolve(__dirname, '..');

const publicFilesPath = path.join(srcPath, '../public/browser');
const indexHtmlPath = path.join(publicFilesPath, 'index.html');

export { srcPath, publicFilesPath, indexHtmlPath };
