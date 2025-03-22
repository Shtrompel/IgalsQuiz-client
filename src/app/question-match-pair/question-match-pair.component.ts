import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import p5 from 'p5';
import { ServiceWebSocketWrapper } from '../service/service.websocket.wrapper';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';

interface Item {
  id: number;
  content: string;
  imgStr : string;
}

@Component({
  selector: 'app-question-match-pair',
  templateUrl: './question-match-pair.component.html',
  styleUrls: ['./question-match-pair.component.css']
})
export class QuestionMatchPairComponent {

  @ViewChild('p5Canvas', { static: true }) p5Canvas!: ElementRef;
  private p5!: p5;
  itemsTop?: Item[];
  itemsBottom?: Item[];

  timeStart: number = 0;
  timeLimit: number = 0;
  titleText: string = "";
  descriptionText: string = "";
  progress: number = 0;

  nodesItems: DraggableNode[] = [];
  nodesTargets: MatchingRectangle[] = [];
  
  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper) {}

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

    this.p5 = new p5(this.sketch.bind(this), this.p5Canvas.nativeElement);
  }

  onQuestionDataRecieved(data: string) {
    console.log(data);
    const jsonData = JSON.parse(data);

    this.timeLimit = jsonData.timeLimit;
    if (this.timeLimit !== -1) {
        this.updateProgress();
    }

    this.titleText = jsonData.title;
    this.descriptionText = jsonData.description;

    this.itemsTop = [];
    for (var choice of jsonData.items)
    {
      this.itemsTop.push({id: choice.id, content: choice.text, imgStr: choice.image});
    }
    QuestionMatchPairComponent.shuffleArray(this.itemsTop);

    this.itemsBottom = [];
    for (var choice of jsonData.targets)
    {
      this.itemsBottom.push({id: choice.id, content: choice.text, imgStr: choice.image});
    }
    QuestionMatchPairComponent.shuffleArray(this.itemsBottom);
  }

  ngOnDestroy(): void {
    if (this.p5) {
      this.p5.remove(); // Completely removes p5 instance
    }
  }

  updateProgress() {
    if (this.timeLimit === -1) return;

    const elapsed = performance.now() - this.timeStart;
    this.progress = Math.min(100, (elapsed / this.timeLimit) * 100);

    if (this.progress < 100) {
        requestAnimationFrame(() => this.updateProgress());
    }
  }

  static shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  };

  sendAnswer() {

    const result = this.nodesTargets.map(node => ({
      targetId: node.id,
      itemId: node.match?.id, // Optional, will be undefined if match is not present
    }));
    
    this.serviceSocket.sendAnswerJson({pairs: result}, performance.now() - this.timeStart);
    this.router.navigate(['/transition-loading/', LoadingWindowType.FINISH_QUESTION]);
  }

  sketch(p: p5): void {
      let draggingNode: DraggableNode | null = null;

      p.setup = () => {
        p.createCanvas(p.windowWidth * 0.8, p.windowHeight * 0.5);
        p.clear();

        var nodeWidth = 0;
        var nodeHeight = 0;
        if (!this.itemsTop || !this.itemsBottom)
          return;

        {
          nodeWidth = p.width / this.itemsTop.length * 0.8;
          nodeHeight = p.height / this.itemsTop.length * 0.8;
          console.log(nodeWidth);

          for (let i = 0; i < this.itemsTop.length; i++) {
            const db = new DraggableNode(
              this.itemsTop[i].id,
              p.map(i, 0, this.itemsTop.length-1, 0, p.width - nodeWidth),
              p.height / 8,
              nodeWidth,
              nodeHeight,
              this.itemsTop[i].content
            );
            this.nodesItems.push(db);

            if (this.itemsTop[i].imgStr == undefined || this.itemsTop[i].imgStr == '')
              continue;

            const currentDb = db;
            const base64DataURL = `data:image/png;base64,${this.itemsTop[i].imgStr}`;
            p.loadImage(base64DataURL, function (newImage) {
              currentDb.img = newImage;
              console.log("Image loaded successfully for item:", i, newImage);
            }, function (error) {
              console.error("Failed to load image for item:", i, error);
            });
          }
        }

        if (this.itemsBottom)
        {
          for (let i = 0; i < this.itemsBottom.length; i++)
          {
            var mr : MatchingRectangle = new MatchingRectangle(
              this.itemsBottom[i].id,
              p.map(i, 0, this.itemsBottom.length-1, 0, p.width - nodeWidth), 
              p.height - p.height / 8 - 2 * nodeHeight, 
              nodeWidth, nodeHeight, 
              this.itemsBottom[i].content);
              this.nodesTargets.push(mr);
            
            if (this.itemsBottom[i].imgStr == undefined || this.itemsBottom[i].imgStr == '')
              continue;

            const currentMr = mr;
            const base64DataURL = `data:image/png;base64,${this.itemsBottom[i].imgStr}`;
            p.loadImage(base64DataURL, function (newImage) {
              currentMr.img = newImage;
              console.log("Image loaded successfully for item:", i, newImage);
            }, function (error) {
              console.error("Failed to load image for item:", i, error);
            });
          }
        }
      };

      p.draw = () => {
        p.clear();

        this.nodesTargets.forEach(rect => rect.show(p));
        this.nodesItems.forEach(node => {
          node.update(p);
          node.show(p);
        });
      };

      const handleStart = (x: number, y: number) => {
        //for (let i = 0; i < nodes.length; i++) 
        for (let i = this.nodesItems.length - 1; i  >= 0; i--) 
        {
          let node = this.nodesItems[i];
          if (node.contains(x, y)) {
            draggingNode = node;
            node.startDrag(x, y);

            this.nodesItems.splice(i, 1);
            this.nodesItems.push(node);
            break;
          }
        }


      };
  
      const handleEnd = (x: number, y: number) => {
        if (draggingNode) {
          let snapped = false;
          for (let rect of this.nodesTargets) {
            if (rect.contains(x, y)) {
              draggingNode.snapTo(rect);
              snapped = true;
              break;
            }
          }
          if (!snapped) draggingNode.release();
          draggingNode = null;
        }
      };

      p.mousePressed = () => handleStart(p.mouseX, p.mouseY);
      p.mouseReleased = () => handleEnd(p.mouseX, p.mouseY);
      p.touchStarted = (e: any) => 
      {
        let inCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
        if (inCanvas) {
          handleStart(p.mouseX, p.mouseY)
          e.stopImmediatePropagation();
          return false;
        }

        return true;
      };
      p.touchEnded = (e: any) => 
      {
        console.log(`${p.mouseX}, ${p.mouseY}`);
        handleEnd(p.mouseX, p.mouseY)
        e.stopImmediatePropagation();
      };
    }
  }

  class DraggableNode {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    dragging: boolean;
    offsetX: number;
    offsetY: number;

    widthDraw: number;
    heightDraw: number;

    widthDraw2: number;
    heightDraw2: number;

    img?: p5.Image;
    match?: MatchingRectangle | null;

    constructor(id: number, x: number, y: number, w: number, h: number, label: string) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.width = this.widthDraw = this.widthDraw2 = w;
      this.height = this.heightDraw = this.heightDraw2 = h;
      this.label = label;
      this.dragging = false;
      this.offsetX = 0;
      this.offsetY = 0;
    }

    show(sketch: any): void {

      let x = this.x;
      let y = this.y;

      x -= (this.widthDraw2 - this.width) / 2;
      y -= (this.heightDraw2 - this.height) / 2;

      sketch.fill(this.dragging ? '#ffaaaa' : '#aaaaff');
      sketch.rect(x, y, this.widthDraw2, this.heightDraw2);
      sketch.fill(0);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text(this.label, x + this.widthDraw2 / 2, y + this.heightDraw2 / 2);

      if (this.img)
      {
        sketch.imageMode(sketch.CENTER);
        sketch.image(this.img, x + this.widthDraw2 / 2, y + this.heightDraw2 / 2, this.widthDraw2, this.heightDraw2);
      }
    }

    update(sketch: any): void {
      if (this.dragging) {
        this.x = sketch.mouseX + this.offsetX;
        this.y = sketch.mouseY + this.offsetY;
      }

      this.widthDraw2 = this.widthDraw2 * 0.5 +  this.widthDraw * 0.5;
      this.heightDraw2 = this.heightDraw2 * 0.5 +  this.heightDraw * 0.5;
    }

    contains(px: number, py: number): boolean {
      return px > this.x && px < this.x + this.width && py > this.y && py < this.y + this.height;
    }

    startDrag(x: number, y: number): void {

      this.dragging = true;
      this.offsetX = this.x - x;
      this.offsetY = this.y - y;

      if (this.img)
      {
        this.widthDraw = this.width * 3;
        this.heightDraw = this.height * 3;
      }
      //this.offsetX += (this.width - this.widthDraw) / 2;
     // this.offsetY += (this.height - this.heightDraw) / 2;

      if (this.match)
      {
        this.match.match = null;
        this.match = null;
      }
    }

    release(): void {
      this.dragging = false;

      this.offsetX = 0;
      this.offsetY = 0;

      this.widthDraw = this.width;
      this.heightDraw = this.height;
    }

    snapTo(rect: MatchingRectangle): void {
      this.release();
      if (!rect.match)
      {
        this.x = rect.x + (rect.width - this.width) / 2;
        this.y = rect.y + (rect.height - this.height) / 2;

        rect.match = this;
        this.match = rect;
      }
    }
  }

  class MatchingRectangle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    match?: DraggableNode | null;
    img? : p5.Image | null;

    constructor(id: number, x: number, y: number, w: number, h: number, label: string, img?: p5.Image) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
      this.label = label;
      this.img = img;
    }

    show(sketch: any): void {
      sketch.noFill();
      sketch.stroke(0);
      sketch.strokeWeight(1);
      sketch.drawingContext.setLineDash([5, 5]);
      sketch.rect(this.x, this.y, this.width, this.height);
      sketch.drawingContext.setLineDash([]);

      if (this.img)
      {
        sketch.image(this.img, this.x, this.y + this.height, this.width, this.height);
      }
      else {
        sketch.fill(255);
        sketch.stroke(0);
        sketch.rect(this.x, this.y + this.height, this.width, this.height);
      }

      sketch.fill(0);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text(this.label, this.x, this.y + this.height, this.width, this.height);
    }

    contains(px: number, py: number): boolean {
      return px > this.x && px < this.x + this.width && py > this.y && py < this.y + this.height;
    }
}