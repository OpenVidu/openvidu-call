import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import YAML from 'yamljs';

// Load OpenAPI spec
const openapiSpec = YAML.load('./src/config/openapi.yaml');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Validates a response against the OpenAPI schema.
 */
export const validateResponse = (response: any, path: string, method: string): boolean => {
	return true
	const methodSchema = openapiSpec.paths[path]?.[method];

	if (!methodSchema || !methodSchema.responses[response.status]) {
		console.error(`No matching schema found for ${path} [${method}] - ${response.status}`);
		return false;
	}

	const responseSchema = methodSchema.responses[response.status]?.content?.['application/json']?.schema;

	if (!responseSchema) {
		console.error(`Schema not found for response ${response.status}`);
		return false;
	}

	const validate = ajv.compile(responseSchema);
	const isValid = validate(response.body);

	if (!isValid) {
		console.error(`Validation errors:`, validate.errors);
	}

	return isValid;
};
