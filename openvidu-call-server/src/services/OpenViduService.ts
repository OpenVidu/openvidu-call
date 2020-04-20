import { HttpClientService } from './HttpClientService';
import bunyan from 'bunyan';

let log = bunyan.createLogger({name: 'OpenViduService: '});

export class OpenViduService {

    private httpClientService: HttpClientService;

	constructor(){
        this.httpClientService = new HttpClientService();
    }

	public async createSession(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<any> {
        const url = openviduUrl + '/api/sessions';
        log.info("Requesting session to ", url);
        const body: string = JSON.stringify({ customSessionId: sessionId});

        const response = await this.httpClientService.post(body, url, openviduSecret);
        return response;
	}

	public async createToken(sessionId: string, openviduUrl: string, openviduSecret: string ): Promise<any> {
		const url = openviduUrl + '/api/tokens';
        log.info("Requesting token to ", url);
        const body: string = JSON.stringify({ session: sessionId });

        const response = await this.httpClientService.post(body, url, openviduSecret);
        return response;
    }
}