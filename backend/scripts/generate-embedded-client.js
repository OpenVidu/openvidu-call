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
	case 'all': {
		generateTypeScriptClient();
		generateJavaClient();
		break;
	}

	case 'ts': {
		generateTypeScriptClient();
		break;
	}

	case 'java': {
		generateJavaClient();
		break;
	}

	default:
		console.log(`Language ${LANGUAGE} not supported`);
		process.exit(1);
}

const generateTypeScriptClient = () => {
	const CLIENT_OUTPUT_DIR = '../sdk/client-ts/src/client';
	const INDEX_FILE = '../sdk/client-ts/src/index.ts';
	const MARKER = '// --- BEGIN TYPES EXPORTS ---';
	console.log('Generating TypeScript client...');

	try {
		// Remove old TypeScript files
		execSync(`rm -rf ${CLIENT_OUTPUT_DIR}/**/*.ts`);

		// Generate new client using openapi-zod-client
		execSync(
			`npx openapi-zod-client 'openapi/embedded-api.yaml' \
				-p .prettierrc \
				--with-docs=true \
				--strict-objects \
				--export-schemas \
				--export-types \
				--group-strategy=none \
				--output ${CLIENT_OUTPUT_DIR}/embedded-api.ts`
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
	const generatedClientFile = `${CLIENT_OUTPUT_DIR}/embedded-api.ts`;
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
	indexFileContent += exportTypes + '\n';

	// Write the updated content back to the index file
	fs.writeFileSync(INDEX_FILE, indexFileContent);

	console.log('TypeScript client generated at sdk/client-ts/');
};

const generateJavaClient = () => {
	const CLIENT_OUTPUT_DIR = '../sdk/client-java';

	try {
		// Remove old Embedded Java client
		execSync(`rm -rf ${CLIENT_OUTPUT_DIR}`);
		const additionalProperties = [
			'developerEmail=commercial@openvidu.io',
			'developerName=OpenVidu',
			'developerOrganization=openvidu.io',
			'developerOrganizationUrl=https://openvidu.io',
			'licenseName=Apache-2.0',
			'annotationLibrary=swagger2',
			'library=restclient'
		].join(',');
		execSync(`
			npx openapi-generator-cli generate \
			-g java \
			-i openapi/embedded-api.yaml \
			-o ${CLIENT_OUTPUT_DIR} \
			--api-package io.openvidu.embedded.api \
			--model-package io.openvidu.embedded.model \
			--invoker-package io.openvidu.embedded.invoker \
			--package-name io.openvidu.embedded \
			--http-user-agent OpenViduEmbeddedJavaClient \
			--group-id io.openvidu \
			--artifact-id openvidu-embedded-client \
			--artifact-version 1.0.0 \
			--additional-properties ${additionalProperties}
		`);
	} catch (error) {
		console.error('Error generating Java client:', error);
		process.exit(1);
	}
};

console.log(`OpenVidu Embedded ${LANGUAGE} client generated successfully`);
