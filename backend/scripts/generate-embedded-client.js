import { execSync } from 'child_process';

const generateNodeClient = () => {
	const CLIENT_OUTPUT_DIR = '../sdk/embedded-node-client';
	const PACKAGE_NAME = 'openvidu-embedded-node-client';
	const USER_AGENT = 'OpenViduEmbeddedNodeClient';
	const PACKAGE_VERSION = '1.0.0';
	const API_NAME_SUFFIX = 'Client';
	const additionalProperties = [
		'enumPropertyNaming=original',
		'licenseName=Apache-2.0',
		'modelPropertyNaming=original',
		`npmName=${PACKAGE_NAME}`,
		`npmVersion=${PACKAGE_VERSION}`,
		'paramNaming=camelCase',
		'platform=node',
		'supportsES6=true',
		'useInversify=true',
		'useSingleRequestParameter=false'
	].join(',');

	try {
		execSync(`rm -rf ${CLIENT_OUTPUT_DIR}`);
		execSync(`
			npx openapi-generator-cli generate \
			-g typescript-fetch \
			-i openapi/embedded-api.yaml \
			-o ${CLIENT_OUTPUT_DIR} \
			--api-name-suffix ${API_NAME_SUFFIX} \
			--api-package OpenViduEmbedded \
			--git-host github.com \
			--git-repo-id openvidu-call \
			--git-user-id openvidu \
			--http-user-agent ${USER_AGENT} \
			--additional-properties ${additionalProperties}
		`);
		// Generate docs
		execSync(`
			npx openapi-generator-cli generate \
			-g markdown \
			-i openapi/embedded-api.yaml \
			-o ${CLIENT_OUTPUT_DIR}/docs \
			--api-name-suffix ${API_NAME_SUFFIX} \
			--api-package OpenViduEmbedded \
			--git-host github.com \
			--git-repo-id openvidu-call \
			--git-user-id openvidu \
			--http-user-agent ${USER_AGENT} \
			--additional-properties ${additionalProperties}
		`);
	} catch (error) {
		console.error('Error generating Node client:', error);
		process.exit(1);
	}
};

const generateJavaClient = () => {
	const CLIENT_OUTPUT_DIR = '../sdk/embedded-java-client';
	const GROUP_ID = 'io.openvidu';
	const ARTIFACT_ID = 'openvidu-embedded-java-client';
	const ARTIFACT_VERSION = '1.0.0';
	const ARTIFACT_NAME = 'OpenViduEmbeddedJavaClient';
	const API_NAME_SUFFIX = 'Client';

	const additionalProperties = [
		`apiPackage=${GROUP_ID}.embedded.api`,
		// 'artifactDescription="OpenVidu Embedded Java Client"',
		`artifactId=${ARTIFACT_ID}`,
		`artifactVersion=${ARTIFACT_VERSION}`,
		'artifactUrl=https://openvidu.io',
		'developerEmail=commercial@openvidu.io',
		'developerName=OpenVidu',
		'developerOrganization=openvidu.io',
		'developerOrganizationUrl=https://openvidu.io',

		'generateClientAsBean=true',
		`groupId=${GROUP_ID}`,
		'hideGenerationTimestamp=true',
		`invokerPackage=${GROUP_ID}.embedded.client`,
		'library=apache-httpclient',
		'licenseName=Apache-2.0',

		`modelPackage=${GROUP_ID}.embedded.model`,
		`configPackage=${GROUP_ID}.embedded.config`,
		'performBeanValidation=true',
		`title=${ARTIFACT_NAME}`,
	].join(',');

	try {
		execSync(`rm -rf ${CLIENT_OUTPUT_DIR}`);
		execSync(`
			npx openapi-generator-cli generate \
			-g java \
			-i openapi/embedded-api.yaml \
			-o ${CLIENT_OUTPUT_DIR} \
			--api-name-suffix ${API_NAME_SUFFIX} \
			--git-host github.com \
			--git-repo-id openvidu-call \
			--git-user-id openvidu \
			--http-user-agent ${ARTIFACT_NAME} \
			--additional-properties ${additionalProperties}
		`);
	} catch (error) {
		console.error('Error generating Java client:', error);
		process.exit(1);
	}
};

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
		generateNodeClient();
		generateJavaClient();
		break;
	}

	case 'node': {
		generateNodeClient();
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

console.log(`OpenVidu Embedded ${LANGUAGE} client generated successfully`);
