import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'ov-login',
	standalone: true,
	imports: [
		MatFormFieldModule,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		FormsModule,
		MatCardModule,
		MatIconModule
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss'
})
export class ConsoleLoginComponent {
	loginForm = new FormGroup({
		username: new FormControl('', [Validators.required, Validators.minLength(4)]),
		password: new FormControl('', [Validators.required, Validators.minLength(4)])
	});
	loginErrorMessage: string | undefined;

	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	ngOnInit(): void {}

	async onSubmit() {
		this.loginErrorMessage = undefined;
		const { username, password } = this.loginForm.value;

		try {
			await this.authService.adminLogin(username!, password!);
			this.router.navigate(['console']);
		} catch (error) {
			if ((error as HttpErrorResponse).status === 429) {
				this.loginErrorMessage = 'Too many login attempts. Please try again later';
			} else {
				this.loginErrorMessage = 'Invalid username or password';
			}
		}
	}
}
