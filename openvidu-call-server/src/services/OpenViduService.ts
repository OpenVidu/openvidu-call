import { AxiosRequestConfig } from 'axios';
import { HttpClientService } from './HttpClientService';
import bunyan from 'bunyan';

let log = bunyan.createLogger({name: 'OpenViduService: '});

export class OpenViduService {

    private httpClientService: HttpClientService;

	constructor(){
        this.httpClientService = new HttpClientService();
    }

	public createSession(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<AxiosRequestConfig> {
        const url = openviduUrl + '/api/sessions';
        log.info("Requesting session to ", url);
        const body: string = JSON.stringify({ customSessionId: sessionId});

        return this.httpClientService.post(body, url, openviduSecret)
	}

	public createToken(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<AxiosRequestConfig> {
		const url = openviduUrl + '/api/tokens';
        log.info("Requesting token to ", url);
		const body: string = JSON.stringify({ session: sessionId});

        return this.httpClientService.post(body, url, openviduSecret)
    }

}