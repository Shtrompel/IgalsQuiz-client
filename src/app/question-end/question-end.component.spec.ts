import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionEndComponent } from './question-end.component';

describe('QuestionEndComponent', () => {
  let component: QuestionEndComponent;
  let fixture: ComponentFixture<QuestionEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionEndComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
