import axios, { AxiosRequestConfig } from 'axios';
import * as https from 'https';
var btoa = require('btoa');
import { CALL_OPENVIDU_CERTTYPE } from '../config';

export class HttpClientService {

	private options: AxiosRequestConfig = {};

	constructor(){}

	public async post(body: string, openviduUrl: string, openviduSecret: string): Promise<any> {

		if(CALL_OPENVIDU_CERTTYPE === 'selfsigned'){
			this.options.httpsAgent = new https.Agent({
				rejectUnauthorized: false
			});
		}

		this.options.headers = {
			Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
			'Content-Type': 'application/json',
		};

		try {
			const response = await axios.post<any>(openviduUrl, body, this.options);
			return response.data;
		} catch (error) {
			throw error;
		}
    }

}