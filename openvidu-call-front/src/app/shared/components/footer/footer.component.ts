import { Component, Input } from '@angular/core';
import { UserName } from '../../types/username-type';
import { VideoType } from '../../types/video-type';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.css']
})
export class FooterComponent{
	@Input() lightTheme: boolean;

	participantsNames: string[] = [];

	constructor() {}

	@Input()
	set participants(participants: UserName[]) {
		this.participantsNames = [];
		participants.forEach((names) => {
			if (!names.nickname.includes(VideoType.SCREEN)) {
				this.participantsNames.push(names.nickname);
			}
		});
		this.participantsNames = [...this.participantsNames];
	}
}
