import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as authCtrl from '../controllers/auth.controller.js';
import rateLimit from 'express-rate-limit';
import { withAdminValidToken } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

// Limit login attempts for avoiding brute force attacks
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 5,
	message: 'Too many login attempts, please try again later.'
});

authRouter.use(bodyParser.urlencoded({ extended: true }));
authRouter.use(bodyParser.json());

// Auth Routes
authRouter.post('/login', authCtrl.login);
authRouter.post('/logout', authCtrl.logout);
authRouter.post('/admin/login', loginLimiter, authCtrl.adminLogin);
authRouter.post('/admin/logout', authCtrl.adminLogout);
authRouter.post('/admin/refresh', authCtrl.adminRefresh);
authRouter.get('/admin/verify', withAdminValidToken, (_req: Request, res: Response) =>
	res.status(200).json({ message: 'Valid token' })
);
