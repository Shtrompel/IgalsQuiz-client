
import { Component } from '@angular/core';

import { ServiceWebSocketWrapper} from '../app/service/service.websocket.wrapper'

import {Title} from "@angular/platform-browser";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'Igals Quiz';

  constructor(private socketWrapper : ServiceWebSocketWrapper, private titleService:Title)
  {
    this.titleService.setTitle(this.title);
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

}