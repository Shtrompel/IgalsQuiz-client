import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionMatchPairComponent } from './question-match-pair.component';

describe('QuestionMatchPairComponent', () => {
  let component: QuestionMatchPairComponent;
  let fixture: ComponentFixture<QuestionMatchPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionMatchPairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionMatchPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
