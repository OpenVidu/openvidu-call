/**
 * @fileoverview This file defines the routes for the embedded API, including
 * serving Swagger documentation and handling example and token generation endpoints.
 *
 * @module routes/embedded
 */

import { Router } from 'express';
import { swaggerUi, swaggerDocs } from '../config/swagger.js';
import { generateToken } from '../controllers/token.controller.js';

const embeddedRouter = Router();

/**
 * Serve Swagger documentation at /docs endpoint.
 */
embeddedRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /embedded/api/example:
 *   get:
 *     summary: Example endpoint
 *     description: Returns a simple example response.
 *     responses:
 *       200:
 *         description: Successful response
 */
embeddedRouter.get('/example', (req, res) => {
	res.status(200).json({ message: 'Hello from the embedded API!' });
});

/**
 * @swagger
 * /embedded/api/token:
 *   post:
 *     summary: Generate token
 *     description: Generates a token for the embedded API.
 *     responses:
 *       200:
 *         description: Token generated successfully
 */
embeddedRouter.post('/token', generateToken);

export { embeddedRouter };
