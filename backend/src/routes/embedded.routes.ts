/**
 * @fileoverview This file defines the routes for the embedded API, including
 * serving Swagger documentation and handling example and token generation endpoints.
 *
 * @module routes/embedded
 */

import YAML from 'yamljs';
import { NextFunction, Router, Response, Request } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateToken } from '../controllers/embedded.controller.js';
import * as OpenApiValidator from 'express-openapi-validator';

const embeddedRouter = Router();

const openapiSpec = YAML.load('src/config/openapi.yaml');
// Validate incoming requests against the OpenAPI specification
const openapiMiddlewareValidator = OpenApiValidator.middleware({
	apiSpec: openapiSpec,
	validateRequests: true,
	validateResponses: true
});

/**
 * Serve Swagger documentation at /docs endpoint.
 */
embeddedRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

embeddedRouter.post('/token', openapiMiddlewareValidator, generateToken);

embeddedRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// format error
	res.status(err.status || 500).json({
		message: err.message,
		errors: err.errors
	});
});
export { embeddedRouter };
