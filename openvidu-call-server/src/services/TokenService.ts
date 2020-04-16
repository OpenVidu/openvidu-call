import { HttpClientService } from './HttpClientService';
import { AxiosRequestConfig } from 'axios';
import bunyan from 'bunyan';

let log = bunyan.createLogger({name: 'TokenService: '});

export class TokenService {
	private httpClientService: HttpClientService;

	constructor(){
        this.httpClientService = new HttpClientService();
    }

	public create(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<AxiosRequestConfig> {
		log.info("sessionID ", sessionId);
		const body: string = JSON.stringify({ session: sessionId});
		const url = openviduUrl + '/api/tokens';

        return this.httpClientService.post(body, url, openviduSecret)
    }

}