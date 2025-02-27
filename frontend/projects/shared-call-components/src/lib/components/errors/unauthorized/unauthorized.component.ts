import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'ov-unauthorized',
	standalone: true,
	imports: [],
	templateUrl: './unauthorized.component.html',
	styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent implements OnInit {
	message = 'Unauthorized access';
	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const reason = params['reason'];
			switch (reason) {
				case 'invalid-token':
					this.message = 'The token provided is not valid';
					break;
				case 'invalid-room':
					this.message = 'The room name is not valid';
					break;
				case 'invalid-participant':
					this.message = 'The participant name must be provided';
					break;
				// case 'no-token':
				// 	this.message = 'No token provided';
				// 	break;
				// case 'no-iframe-allowed':
				// 	this.message = 'The page is not accessible directly from an iframe. Please use the OpenVidu Embedded';
				// 	break;
				// case 'embedded':
				// 	this.message = 'The page is not accessible directly. Please use the OpenVidu Embedded';
				// 	break;
				default:
					this.message = 'Unauthorized access';
					break;
			}
		});
	}
}
