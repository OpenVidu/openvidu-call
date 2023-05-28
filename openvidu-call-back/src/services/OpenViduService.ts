import { Connection, ConnectionProperties, OpenVidu, OpenViduRole, Recording, Session, SessionProperties } from 'openvidu-node-client';
import { OPENVIDU_SECRET, OPENVIDU_URL } from '../config';
import { RetryOptions } from '../utils';

export class OpenViduService {
	MODERATOR_TOKEN_NAME = 'ovCallModeratorToken';
	PARTICIPANT_TOKEN_NAME = 'ovCallParticipantToken';
	moderatorsCookieMap: Map<string, { token: string; recordingId: string }> = new Map<string, { token: string; recordingId: string }>();
	participantsCookieMap: Map<string, string[]> = new Map<string, string[]>();

	protected static instance: OpenViduService;
	private openvidu: OpenVidu;
	private edition: string;

	private constructor() {
		this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
		if (process.env.NODE_ENV === 'production') this.openvidu.enableProdMode();
	}

	static getInstance() {
		if (!OpenViduService.instance) {
			OpenViduService.instance = new OpenViduService();
		}
		return OpenViduService.instance;
	}

	getBasicAuth(): string {
		return this.openvidu.basicAuth;
	}

	getDateFromCookie(cookies: any): number {
		try {
			const cookieToken = cookies[this.MODERATOR_TOKEN_NAME] || cookies[this.PARTICIPANT_TOKEN_NAME];
			if (!!cookieToken) {
				const cookieTokenUrl = new URL(cookieToken);
				const date = cookieTokenUrl?.searchParams.get('createdAt');
				return Number(date);
			} else {
				return Date.now();
			}
		} catch (error) {
			return Date.now();
		}
	}

	getSessionIdFromCookie(cookies: any): string {
		try {
			const cookieToken = cookies[this.MODERATOR_TOKEN_NAME] || cookies[this.PARTICIPANT_TOKEN_NAME];
			const cookieTokenUrl = new URL(cookieToken);
			return cookieTokenUrl?.searchParams.get('sessionId');
		} catch (error) {
			console.log('Session cookie not found', cookies);
			console.error(error);
			return '';
		}
	}

	getSessionIdFromRecordingId(recordingId: string): string {
		return recordingId.split('~')[0];
	}

	isModeratorSessionValid(sessionId: string, cookies: any): boolean {
		try {
			if (!this.moderatorsCookieMap.has(sessionId)) return false;
			if (!cookies[this.MODERATOR_TOKEN_NAME]) return false;
			const storedTokenUrl = new URL(this.moderatorsCookieMap.get(sessionId).token);
			const cookieTokenUrl = new URL(cookies[this.MODERATOR_TOKEN_NAME]);
			const cookieSessionId = cookieTokenUrl.searchParams.get('sessionId');
			const cookieToken = cookieTokenUrl.searchParams.get(this.MODERATOR_TOKEN_NAME);
			const cookieDate = cookieTokenUrl.searchParams.get('createdAt');

			const storedToken = storedTokenUrl.searchParams.get(this.MODERATOR_TOKEN_NAME);
			const storedDate = storedTokenUrl.searchParams.get('createdAt');

			return sessionId === cookieSessionId && cookieToken === storedToken && cookieDate === storedDate;
		} catch (error) {
			return false;
		}
	}

	isParticipantSessionValid(sessionId: string, cookies: any): boolean {
		try {
			if (!this.participantsCookieMap.has(sessionId)) return false;
			if (!cookies[this.PARTICIPANT_TOKEN_NAME]) return false;
			const storedTokens: string[] | undefined = this.participantsCookieMap.get(sessionId);
			const cookieTokenUrl = new URL(cookies[this.PARTICIPANT_TOKEN_NAME]);
			const cookieSessionId = cookieTokenUrl.searchParams.get('sessionId');
			const cookieToken = cookieTokenUrl.searchParams.get(this.PARTICIPANT_TOKEN_NAME);
			const cookieDate = cookieTokenUrl.searchParams.get('createdAt');

			return (
				storedTokens?.some((token) => {
					const storedTokenUrl = new URL(token);
					const storedToken = storedTokenUrl.searchParams.get(this.PARTICIPANT_TOKEN_NAME);
					const storedDate = storedTokenUrl.searchParams.get('createdAt');
					return sessionId === cookieSessionId && cookieToken === storedToken && cookieDate === storedDate;
				}) ?? false
			);
		} catch (error) {
			return false;
		}
	}

	public async createSession(sessionId: string, retryOptions = new RetryOptions()): Promise<Session> {
		while (retryOptions.canRetry()) {
			try {
				console.log('Creating session: ', sessionId);
				let sessionProperties: SessionProperties = { customSessionId: sessionId };
				const session = await this.openvidu.createSession(sessionProperties);
				await session.fetch();
				return session;
			} catch (error) {
				const status = error.message;
				if ((status >= 500 && status <= 504) || status == 404) {
					// Retry is used for OpenVidu Enterprise High Availability for reconnecting purposes
					// to allow fault tolerance
					// 502 to 504 are returned when OpenVidu Server is not available (stopped, not reachable, etc...)
					// 404 is returned when the session does not exist which is returned by fetch operation in createSession
					// and it is not a possible error after session creation
					console.log('Error creating session: ', status, 'Retrying session creation...', retryOptions);
					await retryOptions.retrySleep();
				} else {
					console.log("Unknown error creating session: ", error);
					throw error;
				}
			}
		}
		throw new Error('Max retries exceeded while creating connection');
	}

	public async createConnection(session: Session, nickname: string, role: OpenViduRole, retryOptions = new RetryOptions()): Promise<Connection> {
		while (retryOptions.canRetry()) {
			try {
				console.log(`Requesting token for session ${session.sessionId}`);
				let connectionProperties: ConnectionProperties = { role };
				if (!!nickname) {
					connectionProperties.data = JSON.stringify({
						openviduCustomConnectionId: nickname
					});
				}
				console.log('Connection Properties:', connectionProperties);
				const connection = await session.createConnection(connectionProperties);
				this.edition = new URL(connection.token).searchParams.get('edition');
				return connection;
			} catch (error) {
				const status = Number(error.message);
				if (status >= 500 && status <= 504) {
					// Retry is used for OpenVidu Enterprise High Availability for reconnecting purposes
					// to allow fault tolerance
					console.log('Error creating connection: ', status, 'Retrying connection creation...', retryOptions);
					await retryOptions.retrySleep();
				} else {
					console.log("Unknown error creating connection: ", error);
					throw error;
				}
			}
		}
		throw new Error('Max retries exceeded while creating connection');
	}

	public async startRecording(sessionId: string): Promise<Recording> {
		return this.openvidu.startRecording(sessionId);
	}

	public stopRecording(recordingId: string): Promise<Recording> {
		return this.openvidu.stopRecording(recordingId);
	}

	public deleteRecording(recordingId: string): Promise<Error> {
		return this.openvidu.deleteRecording(recordingId);
	}
	public getRecording(recordingId: string): Promise<Recording> {
		return this.openvidu.getRecording(recordingId);
	}

	public async listAllRecordings(): Promise<Recording[]> {
		return await this.openvidu.listRecordings();
	}

	public async listRecordingsBySessionIdAndDate(sessionId: string, date: number) {
		const recordingList: Recording[] = await this.listAllRecordings();
		return recordingList.filter((recording) => {
			const recordingDateEnd = recording.createdAt + recording.duration * 1000;
			return recording.sessionId === sessionId && recordingDateEnd >= date;
		});
	}

	public async startBroadcasting(sessionId: string, url: string): Promise<void> {
		return this.openvidu.startBroadcast(sessionId, url);
	}

	public async stopBroadcasting(sessionId: string): Promise<void> {
		return this.openvidu.stopBroadcast(sessionId);
	}

	public isPRO(): boolean {
		return this.edition.toUpperCase() === 'PRO';
	}

	public isCE(): boolean {
		return this.edition.toUpperCase() === 'CE';
	}
}
