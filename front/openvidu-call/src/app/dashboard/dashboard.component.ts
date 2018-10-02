import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  public roomForm: FormGroup;
  public version = require('../../../package.json').version;

  constructor(private router: Router, public formBuilder: FormBuilder) {}

  ngOnInit() {
    this.roomForm = this.formBuilder.group({
      roomName: ['', Validators.compose([Validators.required])],
    });
  }

  public goToVideoCall() {
    if (this.roomForm.valid) {
      const roomName = this.roomForm.value.roomName.replace(/ /g, '-'); // replace white spaces by -
      this.router.navigate(['/', roomName]);
    }
  }
}
