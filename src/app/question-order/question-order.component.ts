import { Component, Input, ViewChildren, QueryList, ElementRef,  } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { ServiceWebSocketWrapper} from '../service/service.websocket.wrapper';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';

import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-question-order',
  standalone: false,
  templateUrl: './question-order.component.html',
  styleUrl: './question-order.component.css'
})
export class QuestionOrderComponent {
  timeLimit: number = 0;
  progress: number = 0;
  titleText: string = "";

  movies2 = [
    {"index": 0, "title": "A"},
    {"index": 1, "title": "B"},
    {"index": 2, "title": "C"},
    {"index": 3, "title": "D"}
  ];

  @Input() choices : Array<string> = [];
  colors: Array<Array<number>> = [];
  images : Array<string | null> = [];

  timeStart: number = 0;
  descriptionText: any;
  maxChoices: any = 0;

  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper)
  {

  }

  ngOnInit(): void {
    this.timeStart = performance.now();

    let data : string | null = '';
    if (this.route.snapshot.paramMap.has('data'))
    {
      data = this.route.snapshot.paramMap.get('data');
    }

    if (data === null || data === '')
    data = sessionStorage.getItem('questionData');

    if (data === null || data === "")
      return;

    if (data !== null)
      this.onQuestionDataRecieved(data);
  }

  onQuestionDataRecieved(data: string) {
    const jsonData = JSON.parse(data);

    this.timeLimit = jsonData.timeLimit;
    if (this.timeLimit !== -1) {
        this.updateProgress();
    }

    this.titleText = jsonData.title;
    this.descriptionText = jsonData.description;

    for (var choice of jsonData.choices)
    {
      if (choice.isRight)
        this.maxChoices++;
      this.choices.push(choice.text);
      this.colors.push(choice.color);
      if (choice.hasOwnProperty("image"))
      {
        this.images.push(`data:image/png;base64,${choice.image}`);
      }
      else
        this.images.push(null);

      
    }

    console.log(this.colors);
    console.log(jsonData);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.choices, event.previousIndex, event.currentIndex);
    moveItemInArray(this.colors, event.previousIndex, event.currentIndex);
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
  }

  sendAnswer() {
    this.serviceSocket.sendAnswer(this.choices, performance.now() - this.timeStart);
    this.router.navigate(['/transition-loading/', LoadingWindowType.FINISH_QUESTION]);
  }

  updateProgress() {
    if (this.timeLimit === -1) return;

    const elapsed = performance.now() - this.timeStart;
    this.progress = Math.min(100, (elapsed / this.timeLimit) * 100);

    if (this.progress < 100) {
        requestAnimationFrame(() => this.updateProgress());
    }
  }
  
}
