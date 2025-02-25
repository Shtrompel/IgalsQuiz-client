import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionMinigameWiresComponent } from './question-minigame-wires.component';

describe('QuestionMinigameComponent', () => {
  let component: QuestionMinigameWiresComponent;
  let fixture: ComponentFixture<QuestionMinigameWiresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionMinigameWiresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionMinigameWiresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
