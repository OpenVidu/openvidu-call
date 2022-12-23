import {
	CALL_OPENVIDU_CERTTYPE,
	CALL_STREAMING,
	OPENVIDU_SECRET,
	OPENVIDU_URL,
	RTMP_EXPORTER_CREDENTIALS,
	RTMP_EXPORTER_URL
} from '../config';

import * as express from 'express';
import { Request, Response } from 'express';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
import { OpenViduService } from '../services/OpenViduService';
export const app = express.Router({
	strict: true
});

const openviduService = OpenViduService.getInstance();

export const proxyStreaming = createProxyMiddleware({
	target: RTMP_EXPORTER_URL,
	pathRewrite: {
		'^/streamings/(start|stop)?': '/api/streams/'
	},
	auth: RTMP_EXPORTER_CREDENTIALS,
	selfHandleResponse: true,
	secure: CALL_OPENVIDU_CERTTYPE !== 'selfsigned',
	onProxyReq: (proxyReq, req: Request, res: Response) => {
		console.log('PATH', req.path);

		const IS_STREAMING_ENABLED = CALL_STREAMING.toUpperCase() === 'ENABLED';
		if (IS_STREAMING_ENABLED) {
			const sessionId = openviduService.getSessionIdFromCookie(req?.cookies);
			proxyReq.removeHeader('Cookie');
			if (!!sessionId && openviduService.isValidToken(sessionId, req.cookies)) {
				proxyReq.setHeader('Content-Type', 'application/json');

				if (req.method === 'POST') {
					const rtmpUrl: string = req.body.rtmpUrl;
					const isPRO = openviduService.isPRO();
					const isLocalDeployment = OPENVIDU_URL.includes('localhost') || OPENVIDU_URL.includes('127.0.0.1');
					const port = isLocalDeployment ? 4443 : 443;
					const protocol = OPENVIDU_URL.includes('https') ? 'https' : 'http';
					const ovDomain = OPENVIDU_URL.replace(/^https?:\/\//, '');
					const ovPath = isPRO ? 'inspector' : 'dashboard';
					const pageUrl: string = `${protocol}://OPENVIDUAPP:${OPENVIDU_SECRET}@${ovDomain}/${ovPath}/#/layout-best-fit/${sessionId}/${OPENVIDU_SECRET}/${port}/false`;
					const bodyData = JSON.stringify({ rtmpUrl, pageUrl });
					proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
					proxyReq.write(bodyData);
				} else if (req.method === 'DELETE') {
					console.log('STOP STREAMING');
					const streamingId = openviduService.streamingMap.get(sessionId);
					proxyReq.path += streamingId;
					console.log(proxyReq.path);
				}
			} else {
				res.status(403).send(JSON.stringify({ message: 'Permissions denied to drive streaming' }));
				return res.end();
			}
		} else {
			console.log(`OpenVidu Call Streaming is not enabled`);
			res.status(403).send(JSON.stringify({ message: 'OpenVidu Call Streaming is disabled' }));
			return res.end();
		}
	},
	onProxyRes: responseInterceptor(async (responseBuffer: Buffer, proxyRes, req: Request, res: Response) => {
		proxyRes.headers['set-cookie'] = null;

		if (proxyRes.statusCode === 200) {
			let data = JSON.parse(responseBuffer.toString('utf8'));
			const sessionId = openviduService.getSessionIdFromCookie(req?.cookies);
			data = Object.assign({}, data, { rtmpAvailable: true });

			if (req.method === 'POST') {
				console.log('streaming started.', data);
				openviduService.streamingMap.set(sessionId, data.id);
			} else if (req.method === 'DELETE') {
				console.log('streaming stopped.', data);
				openviduService.streamingMap.delete(sessionId);
			}

			return JSON.stringify(data);
		}
		return responseBuffer;
	}),
	onError: (error: any, req: Request, res: Response) => {
		if (!res.headersSent) {
			let status = 500;
			let response = { message: 'Unexpected error with streaming', rtmpAvailable: true };
			if (error.code === 'ECONNREFUSED') {
				response.message = 'Streaming module has not been found.';
				response.rtmpAvailable = false;
				status = 503;
			}
			res.status(status).send(JSON.stringify(response));
			return res.end();
		}
	}
});
