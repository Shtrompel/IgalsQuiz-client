import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import {DragDropModule} from '@angular/cdk/drag-drop';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EnterNameComponent } from './enter-name/enter-name.component';
import { RouterModule, Routes } from '@angular/router';
import { EnterIDComponent } from './enter-id/enter-id.component';
import { QuestionChoiceComponent } from './question-choice/question-choice.component';
import { TransitionLoadingComponent } from './transition-loading/transition-loading.component';
import { QuestionEndComponent } from './question-end/question-end.component';
import { GameEndComponent } from './game-end/game-end.component';
import { QuestionMinigameWiresComponent } from './question-minigame-wires/question-minigame-wires.component';
import { QuestionOrderComponent } from './question-order/question-order.component';
import { QuestionPaintingComponent } from './question-painting/question-painting.component';


@NgModule({
  declarations: [
    AppComponent,
    EnterNameComponent,
    EnterIDComponent,
    QuestionChoiceComponent,
    TransitionLoadingComponent,
    QuestionEndComponent,
    GameEndComponent,
    QuestionMinigameWiresComponent,
    QuestionOrderComponent,
    QuestionPaintingComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    CdkTableModule, 
    CdkTreeModule
  ],
  exports: [RouterModule,],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
