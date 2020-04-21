import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';
import btoa from 'btoa';
import { DEV_MODE } from '../config';

export class HttpClientService {

	private options: AxiosRequestConfig = {};

	constructor(){}

	public async post(body: string, openviduUrl: string, openviduSecret: string): Promise<any> {

		if(DEV_MODE){
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