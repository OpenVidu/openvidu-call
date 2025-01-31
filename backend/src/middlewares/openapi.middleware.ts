import * as OpenApiValidator from 'express-openapi-validator';
import YAML from 'yamljs';

const openapiSpec = YAML.load('openapi/embedded-api.yaml');

// Validate incoming requests against the OpenAPI specification
export const openapiMiddlewareValidator = OpenApiValidator.middleware({
	apiSpec: openapiSpec,
	validateRequests: true,
	validateResponses: true
});
