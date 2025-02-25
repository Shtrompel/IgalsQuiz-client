import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterIDComponent } from './enter-id.component';

describe('EnterIDComponent', () => {
  let component: EnterIDComponent;
  let fixture: ComponentFixture<EnterIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterIDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
