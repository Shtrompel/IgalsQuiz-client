

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceWebSocketWrapper} from '../service/service.websocket.wrapper'
import {LoadingWindowType } from '../transition-loading/transition-loading.component'

@Component({
  selector: 'app-enter-name',
  templateUrl: './enter-name.component.html',
  styleUrl: './enter-name.component.css'
})
export class EnterNameComponent {

  inputName : String = "";
  
  constructor(public router: Router, private serviceSocket : ServiceWebSocketWrapper)
  {
    /*
    if (!serviceSocket.hasConnection())
    {
      serviceSocket.testConnect();
    }
    */
  }

  onSubmitNameClick()
  {
    this.serviceSocket.sendName(this.inputName.toString());
    this.router.navigate(['/transition-loading/', LoadingWindowType.START_GAME]);
  }


}
