
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceWebSocketWrapper} from '../service/service.websocket.wrapper';

export  enum LoadingWindowType
{
  START_GAME = 0,
  NEXT_QUESTION,
  START_QUESTION,
  FINISH_QUESTION,
  FINISH_GAME
}

@Component({
  selector: 'app-transition-loading',
  templateUrl: './transition-loading.component.html',
  styleUrl: './transition-loading.component.css'
})
export class TransitionLoadingComponent {

  text: string = "";
  timeLeft: number = 0;
  showTimer: boolean = true;

  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper)
  {
  }

  ngOnInit() {
    let strType = this.route.snapshot.paramMap.get('type');
    if (strType !== null)
      this.text = this.typeToText(Number.parseInt(strType));

    let strTime = this.route.snapshot.paramMap.get('time');
    if (strTime !== null)
      this.beginTimer(Number.parseInt(strTime));
    else
      this.showTimer = false;
  }

  beginTimer(time: number) {
    this.timeLeft = time;
    setInterval(() => {
      this.timeLeft--;
      if(this.timeLeft <= 0)
      {
        this.showTimer = false;
        return;
      }
    },1000)
  }

  typeToText(type : LoadingWindowType)
  {
    return [
      "Waiting for the host to start the game",
      "Waiting for the host to start the next question",
      "Waiting for the question to start",
      "Waiting until everyone finished answering",
      "Waiting until everyone finished playing"
  ][type];
  }

}
