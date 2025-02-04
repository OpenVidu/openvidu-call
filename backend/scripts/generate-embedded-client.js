import fs from 'fs';
import { execSync } from 'child_process';

// Check if the script is called with the correct number of arguments
const args = process.argv.slice(2);

if (args.length === 0) {
	console.log('Usage: node generate-embedded-client.js <language>');
	console.log('Example: node generate-embedded-client.js typescript');
	process.exit(1);
}

const LANGUAGE = args[0];

switch (LANGUAGE) {
	case 'ts': {
		const CLIENT_DIR = '../sdk/client-ts/src/client';
		const INDEX_FILE = '../sdk/client-ts/src/index.ts';
		const MARKER = '// --- BEGIN TYPES EXPORTS ---';
		console.log('Generating TypeScript client...');

		try {
			// Remove old TypeScript files
			execSync(`rm -rf ${CLIENT_DIR}/**/*.ts`);

			// Generate new client using openapi-zod-client
			execSync(
				`npx openapi-zod-client 'openapi/embedded-api.yaml' -p .prettierrc --with-docs=true --strict-objects --export-schemas --export-types --group-strategy=none --output ${CLIENT_DIR}/embedded-api.ts`
			);
		} catch (error) {
			console.error('Error generating TypeScript client:', error);
			process.exit(1);
		}

		// Read the current index file
		let indexFileContent = fs.readFileSync(INDEX_FILE, 'utf-8');

		if (indexFileContent.includes(MARKER)) {
			// If marker exists, clean everything from the marker onwards
			indexFileContent = indexFileContent.split(MARKER)[0];
			console.log('Cleaning previous types exports');
		} else {
			// Create a backup of the file if marker doesn't exist
			fs.copyFileSync(INDEX_FILE, `${INDEX_FILE}.bak`);
		}

		// Add the marker to the end of the file
		indexFileContent += `${MARKER}\n`;

		// Extract the types from the generated client
		const generatedClientFile = `${CLIENT_DIR}/embedded-api.ts`;
		const schemasMatch = fs.readFileSync(generatedClientFile, 'utf-8').match(/schemas\s*=\s*\{\s*([^}]*)\}/);

		if (!schemasMatch) {
			console.error('Schemas not found in generated client file.');
			process.exit(1);
		}

		const schemasString = schemasMatch[1];
		const schemas = schemasString.split(',').map((schema) => schema.trim());

		if (!schemas || schemas.length === 0) {
			console.error('No schemas found in generated client file.');
			process.exit(1);
		}

		console.log('Exporting types:', schemas);

		// Generate the export types
		const exportTypes = schemas
			.map((schema) => `export type ${schema} = z.infer<typeof schemas.${schema}>;`)
			.join('\n');
		indexFileContent += exportTypes + '\n'; // Append types after the marker

		// Write the updated content back to the index file
		fs.writeFileSync(INDEX_FILE, indexFileContent);

		console.log('TypeScript client generated at sdk/client-ts/');

		break;
	}

	default:
		console.log(`Language ${LANGUAGE} not supported`);
		process.exit(1);
}

console.log(`OpenVidu Embedded ${LANGUAGE} client generated successfully`);
