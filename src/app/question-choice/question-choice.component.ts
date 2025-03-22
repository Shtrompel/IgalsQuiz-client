import { Component, Input, ViewChildren, QueryList, ElementRef, ViewChild,  } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { ServiceWebSocketWrapper} from '../service/service.websocket.wrapper';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';
import { QuestionComponent } from '../question-componnt';


enum ButtonState {
  NORMAL = 0,
  HOVER,
  PRESSED,
}

@Component({
  selector: 'app-question-choice',
  templateUrl: './question-choice.component.html',
  styleUrl: './question-choice.component.css'
})
export class QuestionChoiceComponent {

  isTouchscreen : Boolean = false;

  @Input() choices : Array<string> = [];
  colors: Array<Array<number>> = [];
  images : Array<string | null> = [];

  @ViewChildren('choiceButton') choiceButtons!: QueryList<ElementRef>;
  @ViewChildren('sendButton') sendButton!: ElementRef;

  @ViewChild('titleElement', { static: false }) titleElement!: ElementRef;
  @ViewChild('progressContainer', { static: false }) progressContainer!: ElementRef;
  @ViewChild('choicesGrid', { static: false }) choicesGrid!: ElementRef;
  @ViewChild('appContainerBig', { static: false }) appContainer!: ElementRef;

  selectedAnswers : Array<string> = [];
  gridStyle: { [key: string]: string } = {};

  jsonData: JSON | null = null;
  cols: number = 0;
  titleText: any;
  isMultiChoice : Boolean = false;
  maxChoices: number = 0;
  timeStart: number = -1.;
  timeLimit: number = -1;
  progress: number = -1;

  groups: { [index: number]: string } = {};
  isRtl: boolean = true;
  initiated: boolean = false;

  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper)
  {
    //for (let i = 0; i < 6; ++i) this.choices.push("asdasd" + i);
    this.updateGridStyle();

    this.isTouchscreen = window.matchMedia("(pointer: coarse)").matches;
  }

  async fetchTestFile(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (err) {
      console.error("Error fetching file:", err);
    }
    return null;
  }

  ngOnInit() {
    this.timeStart = performance.now();

    let data : string | null = '';
    if (this.route.snapshot.paramMap.has('data'))
    {
      data = this.route.snapshot.paramMap.get('data');
    }

    /*
    let promise = this.fetchTestFile('https://raw.githubusercontent.com/Shtrompel/StaticStuff/refs/heads/main/question.txt');
    let that = this;
    promise.then(
      function(value) {
        if (value !== null) 
          that.onQuestionDataRecieved(value); 
      },

      function(error) { 
        console.log(error); 
      }
    );
    */
    
    if (data === null || data === '')
      data = sessionStorage.getItem('questionData');

    if (data === null || data === "")
      return;

    if (data !== null)
      this.onQuestionDataRecieved(data);
  }

  onQuestionDataRecieved(data: string)
  {
    const jsonData = JSON.parse(data);

    this.timeLimit = jsonData.timeLimit;

    if (this.timeLimit !== -1) {
        this.updateProgress();
    }

    if (Object.values(jsonData).includes("isRtl"))
    {
      this.isRtl = jsonData.isRtl;
    }

    this.isMultiChoice = false;
    if (Object.values(jsonData).includes("isMultiChoice"))
    {
      this.isMultiChoice = jsonData["isMultiChoice"];
    }
    else
    {
      var counter : { [key: number]: number } = {};

      let c : number = 0;
      for (var choice of  jsonData.choices)
      {
        if (choice.isRight)
        {
          if (choice.hasOwnProperty("group") && choice.group != -1)
            counter[choice.group] += 1;
          else
            c += 1;
        }
      }

      if (Object.keys(counter).length > 0)
      {
        let maxValue = Math.max(...Object.values(counter))
        this.isMultiChoice = (maxValue > 1) ? true : false;
      }
      else
        this.isMultiChoice = (c > 1) ? true : false;
    }

    this.updateQuestion(jsonData);
  }

  adjustGridHeight(): void {
    const viewportHeight = window.innerHeight;


    // Calculate the height of other elements
    const titleHeight = this.titleElement?.nativeElement?.offsetHeight || 0;
    const sendButtonHeight = this.sendButton?.nativeElement?.offsetHeight || 0;
    const progressContainerHeight = this.progressContainer?.nativeElement?.offsetHeight || 0;
    const x = this.choicesGrid?.nativeElement?.offsetHeight || 0;
    const y = this.appContainer?.nativeElement?.offsetHeight || 0;

    console.log(`${viewportHeight} ${titleHeight} ${sendButtonHeight} ${progressContainerHeight} ${x}`);

    const otherElementsHeight = titleHeight + sendButtonHeight + progressContainerHeight;

    // Calculate the available height for the grid
    var availableHeight = y - otherElementsHeight;
    availableHeight *= 0.7;

    // Set the grid height dynamically
    this.gridStyle['height'] = `${availableHeight}px`;
  }

  ngAfterViewInit()
  {
    this.setButtonColors();
  }

  ngAfterViewChecked()
  {
    if (this.initiated)
    {
      this.adjustGridHeight();
      this.initiated = true;
    }
  }


  updateQuestion(jsonData : any)
  {
    this.titleText = jsonData.description;
    this.choices = [];
    this.maxChoices = 0;
    this.groups = {};

    console.log(jsonData);

    for (var choice of  jsonData.choices)
    {
      this.maxChoices = jsonData.maxChoices;
      this.choices.push(choice.text);
      this.colors.push(choice.color);
      if (choice.hasOwnProperty("image"))
      {
        this.images.push(`data:image/png;base64,${choice.image}`);
      }
      else
        this.images.push(null);
    }

    this.updateGridStyle();
  } 

  updateGridStyle(): void {
    const numAnswers = this.choices.length;

    this.cols = Math.ceil(Math.sqrt(numAnswers));
    const rows = Math.ceil(numAnswers / this.cols);

    this.gridStyle = {
      'overflow': 'hidden', // Corrected
      'display': 'grid',
      'grid-template-columns': `repeat(${this.cols}, 1fr)`,
      'grid-auto-rows': '1fr',
      'width': '100%',
      'height': '40vh',
    };
  }

  getAlignment(index: number): { [key: string]: string } {
    const numChoices = this.choices.length;

    // Determine if the choice is in the last row
    const isLastRow = Math.floor(index / this.cols) === Math.floor((numChoices - 1) / this.cols);
    const itemsInLastRow = numChoices % this.cols || this.cols;
    const i = index % this.cols;

    if (isLastRow && itemsInLastRow < this.cols) {
      const x = 100 * ((this.cols - itemsInLastRow) / 2);

      return { 'transform': `translateX(${x}%)` };
    }

    return {};
  }

  setButtonColors(): void {
    this.choiceButtons.forEach((button : any, index : any) => {

      let colVal = (index / (this.choiceButtons.length - 1));
      colVal = colVal - 0.5;
      
      const element = button.nativeElement;
      element.style.backgroundColor = 'rgb(' + this.colors[index][0] + ' ' + this.colors[index][1] + ' ' + this.colors[index][2] + ')';
      element.style.color = 'black';
    });
  }

  sendAnswer() {
    this.serviceSocket.sendAnswer(this.selectedAnswers, performance.now() - this.timeStart);
    this.router.navigate(['/transition-loading/', LoadingWindowType.FINISH_QUESTION]);
  }
    
  onMouseLeave(button: HTMLButtonElement, index: number) {
    if (this.isTouchscreen)
      return;

    let choice : string = this.choices[index];
    if (this.selectedAnswers.includes(choice))
      return;

    this.setButtonState(index, button, ButtonState.NORMAL);
  }

  onMouseEnter(button: HTMLButtonElement, index: number) {
    if (this.isTouchscreen)
      return;

    let choice : string = this.choices[index];
    if (this.selectedAnswers.includes(choice))
      return;

    let ogColor: Array<number> = this.colors[index];
    this.setButtonState(index, button, ButtonState.HOVER);
  }

  onMouseClick(button: HTMLButtonElement, index: number): void {
    let ogColor: Array<number> = this.colors[index];
    this.setButtonState(index, button, ButtonState.PRESSED);

    let choice : string = this.choices[index];
    if (!this.isMultiChoice)
    {
      this.selectedAnswers.push(choice);
      this.sendAnswer();
      return;
    }

    if (this.selectedAnswers.includes(choice))
    {
      this.setButtonState(index, button, this.isTouchscreen ? ButtonState.NORMAL : ButtonState.HOVER);
      this.selectedAnswers.splice(this.selectedAnswers.indexOf(choice), 1);
    }
    else
    {
      this.selectedAnswers.push(this.choices[index]);

      console.log(this.selectedAnswers);

      if (this.selectedAnswers.length > this.maxChoices)
      {
        let first = this.selectedAnswers[0];
        this.choiceButtons.forEach((button : any, index : any) => {
  
          let str = this.choices[index];
          if (str !== first)
            return;
  
          const element = button.nativeElement;
          element.style.backgroundColor = 'rgb(0,0,0)';
  
          this.setButtonState(index, button.nativeElement as HTMLButtonElement, ButtonState.NORMAL);
        });
        this.selectedAnswers.splice(0, 1);
      }

      console.log(this.selectedAnswers);
    }

  }

  setButtonState(index: number, button: HTMLButtonElement, state : ButtonState)
  {
    const brightness = [
      1.0, // Normal - Original Color
      0.8, // Hover - Slightly darker
      0.6  // Pressed - Darkest
    ][state];

    let ogColor: Array<number> = this.colors[index];
    let color : string = colorMixer(ogColor, [0,0,0], brightness);

    button.style.backgroundColor = color;

    const hasImage = button.style.backgroundImage && button.style.backgroundImage !== 'none';
    if (hasImage)
      button.style.filter = `brightness(${brightness})`;
    else
      button.style.filter = '';
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



function colorChannelMixer(colorChannelA: number, colorChannelB: number, amountToMix: number): number{
  var channelA = colorChannelA*amountToMix;
  var channelB = colorChannelB*(1-amountToMix);
  return channelA+channelB;
}

function colorMixer(rgbA: Array<number>, rgbB: Array<number>, amountToMix:number){
  var r = colorChannelMixer(rgbA[0],rgbB[0],amountToMix);
  var g = colorChannelMixer(rgbA[1],rgbB[1],amountToMix);
  var b = colorChannelMixer(rgbA[2],rgbB[2],amountToMix);
  return "rgb("+r+","+g+","+b+")";
}