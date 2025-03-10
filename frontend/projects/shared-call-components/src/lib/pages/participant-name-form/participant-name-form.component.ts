import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'ov-participant-name-form',
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		MatCardModule,
		MatButtonModule
		// MatIconModule
	],
	templateUrl: './participant-name-form.component.html',
	styleUrl: './participant-name-form.component.scss'
})
export class ParticipantNameFormComponent implements OnInit {
	participantForm: FormGroup;
	protected originUrl: string = '';
	protected error = '';

	constructor(
		protected fb: FormBuilder,
		protected router: Router,
		protected route: ActivatedRoute
	) {
		this.participantForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(4)]]
		});
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			if (params['originUrl']) {
				this.originUrl = params['originUrl'];
				this.error = params['accessError'];
				this.applyErrorToForm();
			}
		});
	}

	get name() {
		return this.participantForm.get('name');
	}

	async onSubmit() {
		if (this.participantForm.valid) {
			const participantName = this.participantForm.value.name;

			let urlTree = this.router.parseUrl(this.originUrl);

			urlTree.queryParams = { ...urlTree.queryParams, 'participant-name': participantName };

			await this.router.navigateByUrl(urlTree);
		}
	}

	private applyErrorToForm() {
		if (this.error === 'participant-exists') {
			this.participantForm.get('name')?.setErrors({ participantExists: true });
		}
	}
}
