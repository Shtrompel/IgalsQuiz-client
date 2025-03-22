import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceWebSocketWrapper} from '../service/service.websocket.wrapper';
import p5 from 'p5';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';
import { QuestionComponent } from '../question-componnt';

@Component({
  selector: 'app-question-painting',
  templateUrl: './question-painting.component.html',
  styleUrl: './question-painting.component.css'
})
export class QuestionPaintingComponent extends QuestionComponent {

  progress: any;

  @ViewChild('p5Canvas', { static: true }) p5Canvas!: ElementRef;
  private p5!: p5;
  timeLimit: number = 10000;
  timeStart: number = -1;
  mouseIn: boolean = true;
  brushSize = 20;
  brushSizeFactor = 1;


  colors = new Array<string>;/*[
    'rgb(255, 0, 0)',    // Red
    'rgb(0, 0, 255)',    // Blue
    'rgb(0, 128, 0)',    // Green
    'rgb(128, 0, 128)',  // Purple
    'rgb(255, 165, 0)',  // Orange
    'rgb(0, 0, 0)',      // Black
    'rgb(255, 215, 0)',  // Gold
    'rgb(255, 255, 255)', // White
    'rgb(127, 127, 127)' // White
  ];*/
  color: number[] = [0, 0, 0];
  backgroundColor: number[] = [50, 50, 50];

  touchesLast: any = new Map<number, any>;
  touchesCurrent: any = new Map<number, any>;
  canvasWidth: number = 300;
  canvasHeight: number = 300;

  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper)
  {
    super();
  }

  ngOnInit(): void {

    let data : string | null = '';
    if (this.route.snapshot.paramMap.has('data'))
    {
      data = this.route.snapshot.paramMap.get('data');
    }
    if (data === null || data === '')
      data = sessionStorage.getItem('questionData');

    if (data === null || data === "")
      return;

    const jsonData = JSON.parse(data);
    this.timeLimit = jsonData.timeLimit;
    this.timeStart = performance.now();
    this.colors = [];

    for (let color of jsonData.paintingColors)
    {
      this.colors.push(color);
    }
    

    this.backgroundColor = this.getColorFromString(jsonData.paintingBackground);
    this.canvasWidth = jsonData.paintingW;
    this.canvasHeight = jsonData.paintingH;

    this.updateProgress();

    if (this.p5)
    {
      this.p5.remove();
    }
    
    this.p5 = new p5(this.sketch.bind(this), this.p5Canvas.nativeElement);
    this.p5Canvas.nativeElement.style.pointerEvents = 'none';
    this.changePaintbrushColor(this.colors[0]);
  }

  ngOnDestroy(): void {

    this.mouseOut();

    if (this.p5) {
      this.p5.remove(); // Completely removes p5 instance
    }
  }

  private sketch(p: p5): void {

    let timeStart = 0;

    p.setup = () => {
      var canvas = p.createCanvas(Math.min(p.windowWidth, this.canvasWidth), Math.min(p.windowHeight, this.canvasHeight));
      p.background(50);
      p.noStroke();
      canvas.mouseOver(this.mouseOver.bind(this));
      canvas.mouseOut(this.mouseOut.bind(this));
      this.updateBrushSize(this.brushSizeFactor);

      timeStart = p.millis();
    };

    p.draw = () => {

      if (!p.focused)
        return;

      if (p.millis() - timeStart >= this.timeLimit)
      {
        this.sendAnswer();
        return;
        
      }

      this.touchesCurrent = new Map<number, any>();

      for (let touch of p.touches) {
        const t : any = touch;
        this.touchesCurrent.set(t.id, t);
      }
      
      this.touchesCurrent.forEach((t: any, id: number) => {
        console.log("touchesCurrent");
        let x0 = t.x, y0 = t.y;
        if (!this.touchesLast.has(id))
        {
          return;
        }
        const t2 = this.touchesLast.get(id);
        var x1 = t2.x, y1 = t2.y;

        this.drawCircles(x0, y0, x1, y1);
      });

      this.touchesLast = this.touchesCurrent;
      
    }

    p.mousePressed = (e: any) => {
      
      console.log("mousePressed");
      if (!this.mouseIn)
        return;
      
      p.circle(p.mouseX, p.mouseY, this.brushSize);
    };

    p.mouseDragged = (e: any) => {
      console.log("mouseDragged");
      if (!this.mouseIn)
        return;
      
      var x0 = p.pmouseX, y0 = p.pmouseY;
      var x1 = p.mouseX, y1 = p.mouseY;
      this.drawCircles(x0, y0, x1, y1);
    };

    p.mouseReleased = (e: any) => {
      console.log("mouseReleased");
    };

    p.touchEnded = (e: any) => {
      e.stopImmediatePropagation();
    };

    p.touchStarted = (e: any) => {
      console.log("touchStarted");
      //e.stopImmediatePropagation();
      let inCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
      if (inCanvas) {
        p.circle(p.mouseX, p.mouseY, this.brushSize);
        e.stopImmediatePropagation();
        return false;
      }
      return true; // Ensure UI elements outside the canvas still work
    };
  
  }

  updateBrushSize(bsf: number)
  {
    this.brushSize = Math.pow(2, bsf);
    this.brushSizeFactor = bsf;
    console.log(this.brushSizeFactor + ", " + this.brushSize);
  }

  drawCircles(x0 : number, y0 : number, x1 : number, y1 : number)
  {
    let sections = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
    if (this.brushSizeFactor == 0 || this.brushSizeFactor == 1)
      sections /= 1;
    else if (this.brushSizeFactor == 2)
    sections /= 2;
    else
      sections /= 3;
    if (x1 != x0)
    {
      for (var i = 0; i <= sections; i++)
      //for (var x = p.min(x0, x1); x <= p.max(x0, x1); x++)
      {
        var x = i / sections * (x1 - x0) + x0;
        var m = (y1 - y0) / (x1 - x0);
        var y = Math.floor(m * (x - x0) + y0);
        this.p5.circle(x, y, this.brushSize);
      }
    }
    else
    {
      for (var y = this.p5.min(y0, y1); y <= this.p5.max(y0, y1); y++)
      {
        this.p5.circle(x0, y, this.brushSize);
      }
    }
  }

  changePaintbrushColor(color: string)
  {
    this.color = this.getColorFromString(color);
    if (this.p5 !== null)
      this.p5.fill(this.color[0], this.color[1], this.color[2]);
  }

  onPaintButtonClicked($event: Event, color: string) {
    console.log("onPaintButtonClicked");
    this.changePaintbrushColor(color);
  }

  onEraserButtonClicked($event: MouseEvent) {
    console.log("onEraserButtonClicked");
    this.p5.fill(
      this.backgroundColor[0],
      this.backgroundColor[1],
      this.backgroundColor[2]);
  }

  mouseOver()
  {
    this.mouseIn = true;
  }

  mouseOut()
  {
    this.mouseIn = false;
  }

  getColorFromString(str: string): Array<number>
  {
    const match = str.match(/\d+/g);
    if (!match || match.length < 3) 
      return [0, 0, 0];

    const r = parseInt(match[0], 10);
    const g = parseInt(match[1], 10);
    const b = parseInt(match[2], 10);

    return [r, g, b];
  }

  getContrastColor(rgb: string): string {
    let color = this.getColorFromString(rgb);

    // Calculate brightness
    const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 125 ? 'black' : 'white';
  }

  onMouseMinusClicked($event: MouseEvent) {
    console.log("onMouseMinusClicked");
    if (this.brushSizeFactor > 0)
      this.updateBrushSize(this.brushSizeFactor - 1);
  }

  onMousePlusClicked($event: MouseEvent) {
    console.log("onMousePlusClicked");
    if (this.brushSizeFactor < 6)
      this.updateBrushSize(this.brushSizeFactor + 1);
  }

  sendAnswer() {

    const img : any = this.p5.get();
    const imgBase64 = img.canvas.toDataURL();

    this.serviceSocket.sendImage(imgBase64, performance.now() - this.timeStart);
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

  override onForceEnd(): void {
    
  }
}
