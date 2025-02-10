import { fileURLToPath } from 'url';
import path from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the source code
const srcPath = path.resolve(__dirname, '..');

const publicFilesPath = path.join(srcPath, '../public/browser');
const indexHtmlPath = path.join(publicFilesPath, 'index.html');

const getOpenApiSpecPath = () => {
	const defaultPath = 'openapi/embedded-api.yaml';
	const fallbackPath = path.resolve(__dirname, '../../../openapi/embedded-api.yaml');

	if (fs.existsSync(defaultPath)) {
		return defaultPath;
	} else {
		console.warn(`Falling back to loading YAML from ${fallbackPath}`);
		return fallbackPath;
	}
};

export { srcPath, publicFilesPath, indexHtmlPath, getOpenApiSpecPath };
