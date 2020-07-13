import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UserName } from '../../types/username-type';

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
			this.participantsNames.push(names.nickname);
		});
		this.participantsNames = [...this.participantsNames];
	}
}
