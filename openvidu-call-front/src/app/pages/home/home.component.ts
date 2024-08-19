import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	UntypedFormBuilder,
	Validators,
	FormsModule,
	ReactiveFormsModule
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatButton } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { ConfigService } from '@services/config.service';
import { RestService } from '@services/rest.service';
import { StorageService } from '@services/storage.service';

import packageInfo from '../../../../package.json';

import { animals, colors, Config, countries, names, uniqueNamesGenerator } from 'unique-names-generator';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
	standalone: true,
	imports: [
    MatToolbar,
    MatIconButton,
    MatTooltip,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    MatButton
]
})
export class HomeComponent implements OnInit, OnDestroy {
	roomForm: FormGroup;
	loginForm: FormGroup;
	version: string;
	isPrivateAccess: boolean;
	username: string;
	loginError: boolean;
	serverConnectionError: boolean;
	isUserLogged = false;
	loading = true;
	private queryParamSubscription: Subscription;

	constructor(
		private router: Router,
		public formBuilder: UntypedFormBuilder,
		private restService: RestService,
		private storageService: StorageService,
		private callService: ConfigService,
		private fb: FormBuilder,
		private route: ActivatedRoute
	) {
		this.loginForm = this.fb.group({
			username: [this.storageService.getUserName() ?? '', [Validators.required, Validators.minLength(4)]],
			password: ['', [Validators.required, Validators.minLength(4)]]
		});

		this.roomForm = this.fb.group({
			roomName: [this.getRandomName(), [Validators.required, Validators.minLength(6)]]
		});
	}

	async ngOnInit() {
		this.version = packageInfo.version;
		this.subscribeToQueryParams();

		try {
			await this.callService.initialize();
			this.isPrivateAccess = this.callService.isPrivateAccess();

			if (this.isPrivateAccess) {
				const userCredentials = this.storageService.getUserCredentials();

				if (!userCredentials) return;

				await this.restService.userLogin(userCredentials);
				this.storageService.setUserCredentials(userCredentials);
				this.username = this.storageService.getUserName();
				this.isUserLogged = true;
				this.loginError = false;
			}
		} catch (error) {
			this.isUserLogged = false;
			// this.serverConnectionError = true;
			this.loginError = true;
		} finally {
			this.loading = false;
		}
	}

	ngOnDestroy(): void {
		if (this.queryParamSubscription) this.queryParamSubscription.unsubscribe();
	}

	generateRoomName(event) {
		event.preventDefault();
		this.roomForm.get('roomName').setValue(this.getRandomName());
	}

	clearRoomName() {
		this.roomForm.get('roomName').setValue('');
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

		try {
			await this.restService.userLogin({ username: this.username, password });
			this.storageService.setUserCredentials({ username: this.username, password });
			this.isUserLogged = true;
		} catch (error) {
			this.isUserLogged = false;
			this.loginError = true;
			console.error('Error doing login ', error);
		}
	}

	async logout() {
		try {
			await this.restService.userLogout();
			this.storageService.clearUserCredentials();
			this.loginError = false;
			this.isUserLogged = false;
		} catch (error) {
			console.error('Error doing logout ', error);
		}
	}

	async goToVideoCall() {
		if (this.roomForm.valid) {
			this.navigateToVideoconference();
		} else {
			console.error('Room name is not valid');
		}
	}

	private subscribeToQueryParams(): void {
		this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
			const roomName = params?.roomName;

			if (roomName) {
				this.loginError = true;
				this.roomForm.get('roomName').setValue(roomName.replace(/[^\w-]/g, ''));
			}
		});
	}

	private navigateToVideoconference() {
		const roomName = this.roomForm.get('roomName').value.replace(/ /g, '-');
		this.roomForm.get('roomName').setValue(roomName);
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
