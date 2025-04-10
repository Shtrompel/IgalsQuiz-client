import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { EnterIDComponent } from '../enter-id/enter-id.component';
import { Router } from '@angular/router';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';
import { AppComponent } from '../app.component';
import { PlayAwardService } from './service.play.award.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceWebSocketWrapper {
  private socket: Socket | null = null;
  serverId: string = '';
  clientId: string = '';
  clientName: string = '';
  testing: boolean = false;

  constructor(private playAwardService: PlayAwardService) {}

  hasConnection(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  reconnect(playerId: string, router: Router, serverIp: string) {
    this.clientId = playerId;
    this.setWebSocket(null, router, serverIp);
  }

  setWebSocket(
    enterIdWindow: EnterIDComponent | null,
    router: Router,
    serverIp: string
  ) {
    sessionStorage.setItem('serverIp', serverIp);

    this.socket = io(serverIp,
      //{path: '/socket.io',
      //transports: ['websocket']},
      //{transports: ['websocket', 'polling'], // Allow both WebSocket and polling}
      );
    if (this.socket === undefined) {
      if (enterIdWindow) enterIdWindow.textError = 'Unable to connect!';
      return;
    }

    this.socket.on('connect', () => {
      if (enterIdWindow) enterIdWindow.textError = 'Loading complete!';

      const msg: SocketMessage = {
        id: this.clientId,
        type: 'connect',
        source: 'client',
        name: '',
      };
      if (this.socket) this.socket.emit('message', msg);
    });

    this.socket.on('disconnect', (reason: string) => {
      let errorMessage = `WebSocket Closed: ${reason}`;
      if (enterIdWindow !== null) enterIdWindow.textError = errorMessage;
    });

    this.socket.on('message', (message: string) => {
      let msg: SocketMessage;
      try {
        msg = JSON.parse(message);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return;
      }

      if (msg.source === 'client') return;

      console.log('Message in: ' + message);

      switch (msg.type) {
        case 'confirm_connect':
          this.clientId = msg.id;
          sessionStorage.setItem('playerId', msg.id);
          console.log('Message in: ' + this.clientId);
          if (enterIdWindow !== null) {
            router.navigate(['/enter-name']);
            //this.sendName("testName");
          }
          break;

        case 'send_question':
          var transitionTime = 3;
          if (msg.jsonData != null) {
            let j = JSON.parse(msg.jsonData.toString());
            if (JSON.stringify(msg.jsonData).includes('transitionTime'))
              transitionTime = j.transitionTime;
          }
          router.navigate([
            '/transition-loading',
            LoadingWindowType.START_QUESTION,
            transitionTime,
          ]);
          break;

        case 'question_start':
          sessionStorage.setItem('questionData', '');
          if (msg.jsonData != null) {
            sessionStorage.setItem('questionData', msg.jsonData.toString());
            let j = JSON.parse(msg.jsonData.toString());

            switch (j.questionType) {
              case 'QuestionChoice':
                router.navigate(['/question-choice']);
                break;

              case 'QuestionOrder':
                router.navigate(['/question-order']);
                break;

              case 'QuestionPainting':
                router.navigate(['/question-painting']);
                break;

              case 'QuestionMatchPairs':
                router.navigate(['/question-match-pair']);
                break;

              case 'QuestionMinigame': {
                switch (j.gameName) {
                  case 'Wires':
                    router.navigate(['/question-minigame-wires']);
                    break;
                  case 'Horror':
                    router.navigate(['/question-horror-game']);
                    break;
                  case 'Balls':
                    router.navigate(['/question-minigame-balls']);
                    break;
                  default:
                    console.log(
                      'Question of type "QuestionMinigame" found. But minigame type is uknown: ' +
                        j.questionType
                    );
                }
                break;
              }
              default:
                console.log('Missing Question Type ' + j.questionType);
                break;
            }
          }
          break;

        case 'question_end':
          console.log(`Current URL: ${router.url}`);
          router.navigate(['/question-end', msg.jsonData]);
          break;

        case 'award':
          this.playAwardService.playAward();
          break;

        case 'punishment':
          this.playAwardService.playPunishment();
          break;

        case 'quiz_end':
          if (
            msg.jsonData != null &&
            JSON.parse(msg.jsonData.toString()).temporarily
          ) {
            router.navigate([
              '/transition-loading',
              LoadingWindowType.NEXT_QUESTION,
            ]);
          } else {
            router.navigate(['/game-end', msg.jsonData]);
          }
          break;
      }
    });
  }

  getWebSocket(): Socket | null {
    return this.socket;
  }

  sendName(name: String): void {
    this.clientName = name.toString();

    if (this.socket === null) return;
    const msg: SocketMessage = {
      id: this.clientId,
      type: 'set_name',
      source: 'client',
      name: name,
    };
    this.socket.emit('message', msg);
  }

  sendGameResult(timePassed: number, success: number) {
    if (this.socket === null) return;

    const msg: SocketMessage = {
      id: this.clientId,
      type: 'send_answer',
      source: 'client',
      name: this.clientName,
      jsonData: JSON.stringify({ timePassed: timePassed, success: success }),
    };
    console.log('Message out: ' + JSON.stringify(msg));
    this.socket.emit('message', msg);
  }

  sendAnswerJson(selectedAnswers: any, timePassed: number) {
    if (this.socket === null) return;

    selectedAnswers.timePassed = timePassed;

    const msg: SocketMessage = {
      id: this.clientId,
      type: 'send_answer',
      source: 'client',
      name: this.clientName,
      jsonData: JSON.stringify(selectedAnswers),
    };
    this.socket.emit('message', msg);
  }

  sendAnswer(selectedAnswers: string[], timePassed: number) {
    if (this.socket === null) return;

    const msg: SocketMessage = {
      id: this.clientId,
      type: 'send_answer',
      source: 'client',
      name: this.clientName,
      jsonData: JSON.stringify({
        answers: selectedAnswers,
        timePassed: timePassed,
      }),
    };
    this.socket.emit('message', msg);
  }

  sendImage(imgBase64: any, timePassed: number) {
    if (this.socket === null) return;

    const msg: SocketMessage = {
      id: this.clientId,
      type: 'send_answer',
      source: 'client',
      name: this.clientName,
      jsonData: JSON.stringify({ image: imgBase64, timePassed: timePassed }),
    };
    this.socket.emit('message', msg);
  }

  onUnload(event: Event) {
    if (this.socket === null) return;

    const msg: SocketMessage = {
      id: this.clientId,
      type: 'disconnect',
      source: 'client',
      name: this.clientName,
    };
    this.socket.emit('message', msg);
  }

  sendMessage(message: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', message);
    } else {
      console.log('WebSocket is not open.');
    }
  }
}

interface SocketMessage {
  id: string;
  type: string;
  source: string;
  name: String;
  jsonData?: String;
}
