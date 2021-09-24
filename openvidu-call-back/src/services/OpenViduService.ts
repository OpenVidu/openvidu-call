import { Connection, ConnectionProperties, OpenVidu, Session, SessionProperties } from "openvidu-node-client";
import { OPENVIDU_URL, OPENVIDU_SECRET } from '../config';

export class OpenViduService {

    private openvidu: OpenVidu;

	constructor(){
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

	public async createSession(sessionId: string): Promise<Session> {
        console.log("Creating session: ", sessionId);
        let sessionProperties: SessionProperties = {customSessionId: sessionId};
        return await this.openvidu.createSession(sessionProperties);
	}

	public async createConnection(session: Session): Promise<Connection> {
        console.log("Requesting token from session ", session);
        let connectionProperties: ConnectionProperties = {};
        return await session.createConnection(connectionProperties);
    }
}
