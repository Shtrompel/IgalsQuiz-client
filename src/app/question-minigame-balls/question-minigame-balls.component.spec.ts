import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionMinigameBallsComponent } from './question-minigame-balls.component';

describe('QuestionMinigameBallsComponent', () => {
  let component: QuestionMinigameBallsComponent;
  let fixture: ComponentFixture<QuestionMinigameBallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionMinigameBallsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionMinigameBallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
