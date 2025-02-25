import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionPaintingComponent } from './question-painting.component';

describe('QuestionPaintingComponent', () => {
  let component: QuestionPaintingComponent;
  let fixture: ComponentFixture<QuestionPaintingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionPaintingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionPaintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
