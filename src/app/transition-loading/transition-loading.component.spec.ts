import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionLoadingComponent } from './transition-loading.component';

describe('TransitionLoadingComponent', () => {
  let component: TransitionLoadingComponent;
  let fixture: ComponentFixture<TransitionLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransitionLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransitionLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
