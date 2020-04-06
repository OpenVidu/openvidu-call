import { ExternalConfigModel } from './external-config';

export class AngularLibraryModel extends ExternalConfigModel {
	private readonly NAME = 'Angular Library';

	constructor() {
		super();
	}

	setTokens(tokens: string[]) {
		if (tokens) {
			this.ovSettings.toolbarButtons.screenShare = tokens.length > 1;
			super.setTokens(tokens);
		}
	}

	public getComponentName() {
		return this.NAME;
	}
}
