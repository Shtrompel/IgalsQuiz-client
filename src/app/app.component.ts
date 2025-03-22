import { Component, HostListener } from '@angular/core';

import { ServiceWebSocketWrapper } from '../app/service/service.websocket.wrapper';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PlayAwardService } from './service/service.play.award.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Igals Quiz';
  showGif: boolean = false;
  gifSrc: string = '';

  gifsMapAward: Array<{ imgPath: string; soundPath: string; length: number }> =
    [];
  gifsMapPunishment: Array<{
    imgPath: string;
    soundPath: string;
    length: number;
  }> = [];

  constructor(
    public router: Router,
    private socketWrapper: ServiceWebSocketWrapper,
    private titleService: Title,
    private playAwardService: PlayAwardService
  ) {
    this.titleService.setTitle(this.title);

    playAwardService.appComponent = this;

    this.gifsMapPunishment.push({
      imgPath: 'assets/images/fnaf-foxy.gif?',
      soundPath: 'assets/sfx/fnaf-foxy.wav?',
      length: 700,
    });
    this.gifsMapPunishment.push({
      imgPath: 'assets/images/fail.gif?',
      soundPath: 'assets/sfx/you failed.wav?',
      length: 6000,
    });
    this.gifsMapPunishment.push({
      imgPath: 'assets/images/fall.gif?',
      soundPath: 'assets/sfx/oh no.wav?',
      length: 2000,
    });

    this.gifsMapAward.push({
      imgPath: 'assets/images/confetti.gif?',
      soundPath: 'assets/sfx/yay.wav?',
      length: 4000,
    });
    this.gifsMapAward.push({
      imgPath: 'assets/images/stfu-issic-is-dancing.gif?',
      soundPath: 'assets/sfx/dancing isaac.wav?',
      length: 4836,
    });
    this.gifsMapAward.push({
      imgPath: 'assets/images/pet.gif?',
      soundPath: 'assets/sfx/squeaky dog.wav?',
      length: 3200,
    });

    const playerId = sessionStorage.getItem('playerId');
    const serverIp = sessionStorage.getItem('serverIp');
    console.log(`playerId: ${playerId}`);
    if (!playerId) {
      this.router.navigate(['/enter-id']);
    } else if (serverIp) {
      socketWrapper.reconnect(playerId, router, serverIp);
    }
  }

  ngOnInit(): void {
    window.addEventListener('unload', this.onBeforeUnload.bind(this));
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('unload', this.onBeforeUnload.bind(this));
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  }

  onBeforeUnload(event: Event): void {
    // Delegate the event handling to the shared service instance
    this.socketWrapper.onUnload(event);
  }


  playAward()
  {
    var index = Math.floor(Math.random() * this.gifsMapAward.length);
    var obj = this.gifsMapAward[index];
    this.playGif(obj);
  }

  playPunishment()
  {
    var index = Math.floor(Math.random() * this.gifsMapPunishment.length);
    var obj = this.gifsMapPunishment[index];
    this.playGif(obj);
  }

  playGif(gif: any) {
    var audio = new Audio(gif.soundPath);
    audio.play();

    this.showGif = false; // Reset GIF visibility
    setTimeout(() => {
      this.gifSrc = gif.imgPath + new Date().getTime(); // Cache-bust to force reload
      this.showGif = true;

      // Hide the GIF after X milliseconds (set to GIF duration)
      setTimeout(() => {
        this.showGif = false;
      }, gif.length); // Change 3000 to your GIF duration in ms
    }, 50);
  }
}
