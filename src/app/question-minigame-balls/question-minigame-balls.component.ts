import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import p5 from 'p5';
import { QuestionComponent } from '../question-componnt';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceWebSocketWrapper } from '../service/service.websocket.wrapper';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';

@Component({
  selector: 'app-question-minigame-balls',
  templateUrl: './question-minigame-balls.component.html',
  styleUrl: './question-minigame-balls.component.css'
})
export class QuestionMinigameBallsComponent  {
  
  @ViewChild('p5Canvas', { static: true }) p5Canvas!: ElementRef;
  private p5!: p5;
  
  private particles: Particle[] = [];
  private throwInterval = 1000;
  private startTime: number = 0;
  private ballStartTime: number = 0;
  private intervalMult = 2;
  private particleCounter = 0;
  private selectedParticles = 0;

  public progress = 0;
  public timeLimit = 1000 * 60 * 2;

  constructor(public router: Router, private route: ActivatedRoute, private serviceSocket : ServiceWebSocketWrapper)
  {}

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
      this.onQuestionDataRecieved(data);
  }

  onQuestionDataRecieved(data: string) {
    const jsonData = JSON.parse(data);
    this.timeLimit = jsonData.timeLimit;

    this.p5 = new p5(this.sketch.bind(this), this.p5Canvas.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroyCanvas();
  }

  private destroyCanvas(): void {
    if (this.p5) {
      this.p5.remove();
    }
  }

  private sketch(p: any): void {
    p.setup = () => {
      p.createCanvas(Math.min(p.windowWidth, 800) * 0.95, Math.min(p.windowHeight, 600)* 0.95);
      this.startTime = p.millis();
      this.ballStartTime = p.millis();
    };

    p.draw = () => {
      p.background('#385574');

      p.textSize(24);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(0);
      p.text(`Circles Caught: ${this.selectedParticles}`, p.width/2, 50);


      this.progress = (p.millis() - this.startTime) / this.timeLimit * 100;
      if (this.progress > 100)
      {
        console.log(this.selectedParticles, this.particleCounter);
        this.serviceSocket.sendGameResult(p.millis() - this.startTime, this.selectedParticles / this.particleCounter);
        this.router.navigate(['/transition-loading/', LoadingWindowType.FINISH_QUESTION]);
      }

      if (p.millis() - this.ballStartTime > this.throwInterval) {
        this.addParticle(p);

        this.throwInterval = 1000 * this.intervalMult / p.log(this.particleCounter + 2);
        this.particleCounter += 1;

        this.ballStartTime = p.millis();
      }

      let i = this.particles.length;
      while (i--) {
        const particle = this.particles[i];
        particle.vel.add(p.createVector(0, 0.1));

        particle.update();
        particle.display(p);

        if (particle.y > p.height + 100) {
          this.particles.splice(i, 1);
        }
      }
    };

    p.mousePressed = () => {
      this.onScreenPressed(p.mouseX, p.mouseY);
    };

    p.touchStarted = () => 
    {
      for (let touch of p.touches)
        this.onScreenPressed(touch.x, touch.y);
    };
  }

  onScreenPressed(x: number, y: number)
  {
    let i = this.particles.length;
      while (i--) {
        const particle = this.particles[i];
        if (Math.pow(x - particle.x, 2) + Math.pow(y - particle.y, 2) < particle.radius * particle.radius) {
          this.particles.splice(i, 1);
          this.selectedParticles += 1;
        }
      }
  }

  private addParticle(p: any): void {
    const direction = p.createVector(p.random(p.width), p.random(p.height));
    direction.add(p.createVector(p.width / 2, p.height / 2));
    direction.div(2);
    const origin = p.createVector(p.random(p.width), p.height + 50);
    const dir = p5.Vector.sub(direction, origin);
    dir.normalize();
    dir.mult(p.random(6, 12));
    this.particles.push(new Particle(origin, dir));
  }
}

class Particle extends p5.Vector {
  vel: p5.Vector;
  radius: number = 25;

  constructor(pos: p5.Vector, vel: p5.Vector) {
    super(pos.x, pos.y, pos.z);
    this.vel = vel.copy();
  }

  update(): void {
    this.add(this.vel);
  }

  display(p: any): void {
    p.fill('#f3f0e2');
    p.stroke(0);
    p.strokeWeight(2);
    p.circle(this.x, this.y, this.radius * 2);
  }
}