import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenviduSessionComponent } from './openvidu-angular.component';

describe('OpenviduSessionComponent', () => {
  let component: OpenviduSessionComponent;
  let fixture: ComponentFixture<OpenviduSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenviduSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenviduSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
