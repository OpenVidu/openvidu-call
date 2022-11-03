import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.services';
import { CallService } from 'src/app/services/call.service';
import { animals, colors, Config, countries, names, uniqueNamesGenerator } from 'unique-names-generator';
import packageInfo from '../../../../package.json';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
	sessionForm: UntypedFormGroup = new UntypedFormGroup({
		sessionName: new UntypedFormControl('', [Validators.minLength(6), Validators.required])
	});
	loginForm: UntypedFormGroup = new UntypedFormGroup({
		username: new UntypedFormControl('', []),
		password: new UntypedFormControl('', [])
	});
	version: string;
	isPrivateAccess: boolean;
	username: string;
	loginError: boolean;
	serverConnectionError: boolean;
	isUserLogged: boolean = false;
	loading: boolean = true;
	private queryParamSubscription: Subscription;
	private loginSubscription: Subscription;

	constructor(
		private router: Router,
		public formBuilder: UntypedFormBuilder,
		private authService: AuthService,
		private callService: CallService,
		private route: ActivatedRoute
	) {}

	async ngOnInit() {
		this.version = packageInfo.version;
		this.sessionForm.get('sessionName').setValue(this.getRandomName());
		this.subscribeToQueryParams();

		try {
			await this.callService.initialize();
			this.isPrivateAccess = this.callService.isPrivateAccess();

			if (this.isPrivateAccess) {
				this.subscribeToLogin();
				this.loginForm.get('username').setValidators(Validators.required);
				this.loginForm.get('username').setValue(this.authService.getUsername());
				this.loginForm.get('password').setValidators(Validators.required);
				this.loginForm.get('password').setValue(this.authService.getPassword());
				await this.authService.loginUsingLocalStorageData();
			}

			this.username = this.authService.getUsername();
		} catch (error) {
			this.serverConnectionError = true;
		} finally {
			this.loading = false;
		}
	}

	ngOnDestroy(): void {
		if (this.queryParamSubscription) this.queryParamSubscription.unsubscribe();
		if (this.loginSubscription) this.loginSubscription.unsubscribe();
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

	async login() {
		// Invoked when login form is valid
		this.loginError = false;
		this.username = this.loginForm.get('username').value;
		const password = this.loginForm.get('password').value;
		await this.authService.login(this.username, password);
	}

	logout() {
		this.authService.logout();
		this.loginError = false;
	}

	async goToVideoCall() {
		if (this.sessionForm.valid) {
			this.navigateToVideoconference();
		} else {
			console.error('Session name is not valid');
		}
	}

	private subscribeToLogin() {
		this.loginSubscription = this.authService.isLoggedObs.subscribe((isLogged) => {
			this.isUserLogged = isLogged;
			this.loginError = this.authService.hadLoginError();
		});
	}

	private subscribeToQueryParams(): void {
		this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
			if (!!params?.sessionId) {
				this.loginError = true;
				const sessionId = params.sessionId.replace(/[^\w-]/g, '');
				this.sessionForm.get('sessionName').setValue(sessionId);
			}
		});
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
