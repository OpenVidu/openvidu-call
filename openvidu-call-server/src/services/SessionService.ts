import { AxiosRequestConfig } from 'axios';
import { HttpClientService } from './HttpClientService';
import bunyan from 'bunyan';

let log = bunyan.createLogger({name: 'SessionService: '});

export class SessionService {

    private httpClientService: HttpClientService;

	constructor(){
        this.httpClientService = new HttpClientService();
    }

	public create(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<AxiosRequestConfig> {
        log.info("sessionID ", sessionId);
        const body: string = JSON.stringify({ customSessionId: sessionId});
        const url = openviduUrl + '/api/sessions';

        return this.httpClientService.post(body, url, openviduSecret)
    }

}