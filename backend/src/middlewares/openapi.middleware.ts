import * as OpenApiValidator from 'express-openapi-validator';
import { getOpenApiSpecPath } from '../utils/path-utils.js';
import YAML from 'yamljs';


const openapiSpec = YAML.load(getOpenApiSpecPath());

// Validate incoming requests against the OpenAPI specification
export const openapiMiddlewareValidator = OpenApiValidator.middleware({
	apiSpec: openapiSpec,
	validateRequests: true,
	validateResponses: true
});
