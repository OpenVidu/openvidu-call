import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';
import btoa from 'btoa';

export class HttpClientService {

	private options: AxiosRequestConfig = {};

	constructor(){}

	public post(body: string, openviduUrl: string, openviduSecret: string): Promise<AxiosRequestConfig> {

		this.options.httpsAgent = new https.Agent({
			rejectUnauthorized: false
		});
		this.options.headers = {
			Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
			'Content-Type': 'application/json'
		};

        return axios.post<string>(openviduUrl, body, this.options);
    }

}