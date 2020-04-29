export enum AvatarType {
	RANDOM = 'random',
	VIDEO = 'video'
}

export interface ChatMessage {
	isLocal: boolean;
	nickname: string;
	message: string;
	userAvatar: string;
}
