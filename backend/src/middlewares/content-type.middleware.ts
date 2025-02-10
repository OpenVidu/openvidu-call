import { Request, Response, NextFunction } from 'express';

export const mediaTypeValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (req.method === 'GET') {
		return next();
	}

	const supportedMediaTypes = ['application/json'];
	const contentType = req.headers['content-type'];

	if (!contentType || !supportedMediaTypes.includes(contentType)) {
		return res.status(415).json({
			error: `Unsupported Media Type. Supported types: ${supportedMediaTypes.join(', ')}`
		});
	}

	next();
};
