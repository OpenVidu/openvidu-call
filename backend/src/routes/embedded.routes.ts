
import YAML from 'yamljs';
import { Router, Response, Request, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { addParticipant } from '../controllers/embedded.controller.js';
import { openapiMiddlewareValidator } from '../middlewares/openapi.middleware.js';
import { getOpenApiSpecPath } from '../utils/path-utils.js';

const embeddedRouter = Router();

const openapiSpec = YAML.load(getOpenApiSpecPath());

/**
 * Serve Swagger documentation at /docs endpoint.
 */
embeddedRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

embeddedRouter.post('/participant', openapiMiddlewareValidator, addParticipant);

embeddedRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
	res.status(err.status || 500).json({
		message: err.message,
		errors: err.errors
	});
});

export { embeddedRouter };
