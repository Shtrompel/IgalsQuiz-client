import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {ServiceWebSocketWrapper } from '../service/service.websocket.wrapper';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-enter-id',
  templateUrl: './enter-id.component.html',
  styleUrl: './enter-id.component.css'
})
export class EnterIDComponent {
  title = 'SocketTest';

  tfIpStr : string = "";
  textError : string = "";

  testing : boolean = false;

  constructor(public router: Router, private serviceSocket : ServiceWebSocketWrapper)
  {
    //this.router.navigate(['/question-painting/']);

    this.tfIpStr = "ws://192.168.68.55:5205";

    if (this.testing)
    {
      this.serviceSocket.testing = true;
      var socket: Socket;
      socket = io(this.tfIpStr);
      this.serviceSocket.setWebSocket(this, this.router, socket);
    }
  }

  
  onStartClick()
  {
    if (this.tfIpStr.length == 0)
    {
      this.textError = "Insert Game IP!";
      return;
    }
    
    this.textError = "Loading...";

    var socket: Socket;
    socket = io(this.tfIpStr);
    this.serviceSocket.setWebSocket(this, this.router, socket);

  }

}
