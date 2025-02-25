
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceWebSocketWrapper} from '../service/service.websocket.wrapper';
import p5 from 'p5';


@Component({
  selector: 'app-question-minigame-wires',
  templateUrl: './question-minigame-wires.component.html',
  styleUrl: './question-minigame-wires.component.css'
})
export class QuestionMinigameWiresComponent {
  @ViewChild('p5Canvas', { static: true }) p5Canvas!: ElementRef;
  private p5!: p5;

  private connectors: Connector[] = [];
  private selected: Connector | null = null;
  private connections: [Connector, Connector][] = [];
  private timer: number = 60;
  private gameEnded: boolean = false;
  private cablesCount: number = 5;

  private touchStartPositions: { x: number, y: number }[] = [];
  timeLimit: any;

  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper)
  {
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
    if (data !== null)
    {
      const jsonData = JSON.parse(data);
      this.timeLimit = jsonData.timeLimit;
      this.cablesCount = jsonData.gameDifficulty;
    }

    this.p5 = new p5(this.sketch.bind(this), this.p5Canvas.nativeElement);
  }

  private hsv2rgb(h: number, s: number, v: number): number[] {
    let f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
  }

  private sketch(p: p5): void {
    p.setup = () => {
      p.createCanvas(Math.min(p.windowWidth, 800), Math.min(p.windowHeight, 600));
      let colors: p5.Color[] = [];
      for (let i = 0; i < this.cablesCount; i++) {
        let co = this.hsv2rgb(i / this.cablesCount * 255, 1, 1);
        let c = p.color(co[0] * 255, co[1] * 255, co[2] * 255);
        colors.push(c);
        let y = p.map(i, -1, this.cablesCount + 1, 0, p.height);
        this.connectors.push(new Connector(p, p.width/5*1, y, c, p.height / this.cablesCount));
      }

      p.shuffle(colors, true);

      for (let i = 0; i < colors.length; i++) {
        let y = p.map(i, -1, this.cablesCount + 1, 0, p.height);
        this.connectors.push(new Connector(p, p.width/5*4, y, colors[i], p.height / this.cablesCount * 0.8));
      }

      this.timer = p.millis();
    };

    p.draw = () => {

      if (p.millis() - this.timer >= this.timeLimit)
      {
        this.serviceSocket.sendGameResult(p.millis() - this.timer, this.connections.length / this.cablesCount);
        p.noLoop();
      }
      let timeLeft = Math.floor((this.timeLimit - p.millis() - this.timer)/1000);

      p.background(50);
      this.connectors.forEach(connector => connector.display(p));
      p.strokeWeight(4);
      this.connections.forEach(connection => {
        p.stroke(connection[0].color);
        this.drawBezierLine(p, connection[0], connection[1]);
      });
      if (this.selected) {
        p.stroke(255, 150);
        p.strokeWeight(4);
        this.drawBezierLine(p, this.selected, { x: p.mouseX, y: p.mouseY } as any);
      }
      p.fill(255);
      p.textSize(24);
      p.textAlign(p.LEFT);
      p.text(`Time: ${timeLeft}s`, 20, 40);
      if (this.gameEnded) {
        this.displayWinMessage(p);
      }
    };

    p.mousePressed = () => {
      if (!this.gameEnded) {
        this.selectConnector(p.mouseX, p.mouseY);
      }
    };

    p.mouseReleased = () => {
      if (this.selected) {
        this.checkConnection(p.mouseX, p.mouseY);
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.touchStarted = () => {
      if (!this.gameEnded) {
        const t = p.touches[0] as any;
        this.selectConnector(t.x, t.y);
      }
      
      return false; // Prevents page scrolling
    }
    
    p.touchEnded  = (event : any) => {
      if (this.selected) {
        this.checkConnection(p.mouseX, p.mouseY);
      }

      return false;
    }
    
  }

  private selectConnector(x: number, y: number): void {
    for (let connector of this.connectors) {
      if (connector.isHovered(x, y) && !connector.connected) {
        this.selected = connector;
        break;
      }
    }
  }

  private checkConnection(x: number, y: number): void {
    for (let connector of this.connectors) {
      if (
        connector !== this.selected &&
        connector.isHovered(x, y) &&
        connector.color.toString() === this.selected?.color.toString()
      ) {
        connector.connected = true;
        this.selected!.connected = true;
        this.connections.push([this.selected!, connector]);

        let timeLeft = Math.floor((this.timeLimit - this.p5.millis() - this.timer)/1000);
        this.selected = null;
        if (this.connections.length === this.cablesCount) 
        {
          this.endGame();
          this.p5.noLoop();
        }
        return;
      }
    }
    this.selected = null;
  }

  private drawBezierLine(p: p5, start: Connector, end: Connector): void {
    let midX = (start.x + end.x) / 2;
    let midY = (start.y + end.y) / 2;
    let controlOffset = 60;
    let controlPointX = midX;
    let controlPointY = midY - controlOffset;
    p.noFill();
    p.strokeWeight(4);
    p.stroke(start.color);
    p.bezier(start.x, start.y, controlPointX, controlPointY, controlPointX, controlPointY, end.x, end.y);
  }

  private endGame(): void {
    this.gameEnded = true;
    this.serviceSocket.sendGameResult(this.p5.millis() - this.timer, 1.0);
  }

  private displayWinMessage(p: p5): void {
    p.fill(255);
    p.textSize(48);
    p.textAlign(p.CENTER);
    p.text("You Win!", p.width / 2, p.height / 2 - 40);
    p.textSize(32);
  }
}

class Connector {
  x: number;
  y: number;
  color: p5.Color;
  connected: boolean = false;
  height: number = -1;

  private p: p5;
  

  constructor(p: p5, x: number, y: number, color: p5.Color, height: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.color = color;
    this.height = height;
  }

  display(p: p5): void {
    p.fill((this.connected ? p.color(200) : this.color));
    p.noStroke();
    p.rectMode(p.CENTER);
    p.rect(this.x, this.y, 40, this.height);
  }

  isHovered(px: number, py: number): boolean {
    return px > this.x - 20 && px < this.x + 20 && py > this.y - this.height/2 && py < this.y + this.height/2;
  }
}
