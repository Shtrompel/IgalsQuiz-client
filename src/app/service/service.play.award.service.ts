import { Injectable } from '@angular/core';
import { AppComponent } from '../app.component';
@Injectable({
  providedIn: 'root'
})
export class PlayAwardService {
  appComponent?: AppComponent;

  playAward() {
    if (this.appComponent)
     this.appComponent.playAward();
  }

  playPunishment() {
    if (this.appComponent)
     this.appComponent.playPunishment();
  }
}
