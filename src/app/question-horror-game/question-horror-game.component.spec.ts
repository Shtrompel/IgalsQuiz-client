import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionHorrorGameComponent } from './question-horror-game.component';

describe('QuestionHorrorGameComponent', () => {
  let component: QuestionHorrorGameComponent;
  let fixture: ComponentFixture<QuestionHorrorGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionHorrorGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionHorrorGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
