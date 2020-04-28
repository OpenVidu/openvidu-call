import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UserModel } from '../../models/user-model';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
	@Input() lightTheme: boolean;

	participantsNames: string[] = [];

	constructor() {}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {}

	ngOnInit() {}

	@Input()
	set participants(participants: UserModel[]) {
		this.participantsNames = [];
		participants.forEach((user) => {
			if (user.isCamera()) {
				this.participantsNames.push(user.getNickname());
			}
		});
		this.participantsNames = [...this.participantsNames];
	}
}
