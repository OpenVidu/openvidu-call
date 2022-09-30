import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.services';
import { animals, colors, Config, countries, names, uniqueNamesGenerator } from 'unique-names-generator';
import packageInfo from '../../../../package.json';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
	sessionForm: FormGroup = new FormGroup({
		username: new FormControl('', []),
		password: new FormControl('', []),
		sessionName: new FormControl('', [Validators.minLength(6), Validators.required])
	});
	version: string;
	hasAppPrivateAccess: boolean;
	username: string;
	loginError: boolean;
	serverConnectionError: boolean;
	private queryParamSubscription: Subscription;

	constructor(private router: Router, public formBuilder: FormBuilder, private authService: AuthService, private route: ActivatedRoute) {}

	async ngOnInit() {
		this.version = packageInfo.version;
		this.sessionForm.get('sessionName').setValue(this.getRandomName());

		try {
			await this.authService.initialize();
			this.hasAppPrivateAccess = this.authService.hasPrivateAccess();
			if (this.hasAppPrivateAccess) {
				this.sessionForm.get('username').setValidators(Validators.required);
				this.sessionForm.get('username').setValue(this.authService.getUsername());
				this.sessionForm.get('password').setValidators(Validators.required);
				this.sessionForm.get('password').setValue(this.authService.getPassword());
			}

			this.subscribeToQueryParams();
		} catch (error) {
			console.error(error);
			this.serverConnectionError = true;
		}
	}

	ngOnDestroy(): void {
		if (this.queryParamSubscription) this.queryParamSubscription.unsubscribe();
	}

	subscribeToQueryParams(): void {
		this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
			if (!!params?.sessionId) {
				this.loginError = true;
				const sessionId = params.sessionId.replace(/[^\w-]/g, '');
				this.sessionForm.get('sessionName').setValue(sessionId);
			}
		});
	}

	generateSessionName(event) {
		event.preventDefault();
		this.sessionForm.get('sessionName').setValue(this.getRandomName());
	}
	keyDown(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			this.goToVideoCall();
		}
	}

	async goToVideoCall() {
		if (this.sessionForm.valid) {
			if (this.hasAppPrivateAccess) {
				const username = this.sessionForm.get('username').value;
				const password = this.sessionForm.get('password').value;
				this.authService.setCredentials(username, password);
			}
			this.navigateToVideoconference();
		} else {
			console.error('Session name is not valid');
		}
	}

	private navigateToVideoconference() {
		const roomName = this.sessionForm.get('sessionName').value.replace(/ /g, '-');
		this.sessionForm.get('sessionName').setValue(roomName);
		this.router.navigate(['/', roomName]);
	}

	private getRandomName(): string {
		const configName: Config = {
			dictionaries: [names, countries, colors, animals],
			separator: '-',
			style: 'lowerCase'
		};
		return uniqueNamesGenerator(configName).replace(/[^\w-]/g, '');
	}
}
