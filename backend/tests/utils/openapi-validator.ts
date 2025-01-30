import Ajv from 'ajv';
import YAML from 'yamljs';

// Load OpenAPI spec
const openapiSpec = YAML.load('openapi/embedded-api.yaml');

const ajv = new Ajv({
	strict: false, // Allow keywords for validation
	removeAdditional: "failing" // Remove additional properties when validation fails
  });


/**
 * Validates a response against the OpenAPI schema.
 */
export const validateResponse = (response: any, path: string, method: string): boolean => {
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

	const isValid = ajv.validate(responseSchema, response.body);

	if (!isValid) {
		console.error(`Validation errors:`, ajv.errors);
	}

	return isValid;
};
