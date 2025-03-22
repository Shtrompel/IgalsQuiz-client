import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {EnterIDComponent} from './enter-id/enter-id.component'
import {EnterNameComponent} from './enter-name/enter-name.component'
import {QuestionChoiceComponent} from './question-choice/question-choice.component'
import {TransitionLoadingComponent} from './transition-loading/transition-loading.component'
import { QuestionEndComponent } from './question-end/question-end.component';
import { GameEndComponent } from './game-end/game-end.component';
import { QuestionMinigameWiresComponent } from './question-minigame-wires/question-minigame-wires.component';
import { QuestionOrderComponent } from './question-order/question-order.component';
import { QuestionPaintingComponent } from './question-painting/question-painting.component';
import { QuestionHorrorGameComponent } from './question-horror-game/question-horror-game.component';
import { QuestionMinigameBallsComponent } from './question-minigame-balls/question-minigame-balls.component';
import { QuestionMatchPairComponent } from './question-match-pair/question-match-pair.component';

const routes: Routes = [

  { path: 'enter-id', component: EnterIDComponent},
  { path: 'enter-name', component: EnterNameComponent },
  
  { path: 'question-choice', component: QuestionChoiceComponent },
  { path: 'question-choice/:data', component: QuestionChoiceComponent },
  { path: 'question-order', component: QuestionOrderComponent },
  { path: 'question-painting', component: QuestionPaintingComponent },
  { path: 'question-horror-game', component: QuestionHorrorGameComponent },
  { path: 'question-match-pair', component: QuestionMatchPairComponent },

  { path: 'transition-loading/:type', component: TransitionLoadingComponent },
  { path: 'transition-loading/:type/:time', component: TransitionLoadingComponent },
  { path: 'question-end/:data', component: QuestionEndComponent },
  { path: 'game-end/:data', component: GameEndComponent },
  { path: 'question-minigame-wires', component: QuestionMinigameWiresComponent },
  { path: 'question-minigame-balls', component: QuestionMinigameBallsComponent },

  { path: '', redirectTo: '/enter-id', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
 }
