import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenviduComponentsComponent } from './openvidu-components.component';

describe('OpenviduComponentsComponent', () => {
  let component: OpenviduComponentsComponent;
  let fixture: ComponentFixture<OpenviduComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenviduComponentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenviduComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
