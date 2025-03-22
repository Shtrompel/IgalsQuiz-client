import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MazeService } from './mazeutils/mazetuils.maze.service';
import { HttpClient } from '@angular/common/http';
import { GameContext } from './mazeutils/mazeutils.maze.gamecontext';
import { Pos } from './mazeutils/mazeutils.pos';
import { getFrameTitle } from './mazeutils/mazeutils.frames';
import { lastValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceWebSocketWrapper } from '../service/service.websocket.wrapper';
import { LoadingWindowType } from '../transition-loading/transition-loading.component';
import { QuestionComponent } from '../question-componnt';

@Component({
  selector: 'app-question-horror-game',
  templateUrl: './question-horror-game.component.html',
  styleUrl: './question-horror-game.component.css'
})
export class QuestionHorrorGameComponent  {

  title = 'HorrorGameTest';

  @ViewChild('gridCanvas', { static: true })
  gridCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('buttonRotate', { static: true })
  buttonRotate!: ElementRef<HTMLButtonElement>;
  @ViewChild('buttonLeft', { static: true })
  buttonLeft!: ElementRef<HTMLButtonElement>;
  @ViewChild('buttonForward', { static: true })
  buttonForward!: ElementRef<HTMLButtonElement>;
  @ViewChild('buttonRight', { static: true })
  buttonRight!: ElementRef<HTMLButtonElement>;
  @ViewChild('buttonShoot', { static: true })
  buttonShoot!: ElementRef<HTMLButtonElement>;

  private ctx!: CanvasRenderingContext2D;
  context: GameContext | undefined;
  drawMode: number = 1;
  drawFrame!: (pos: Pos) => void;
  mazeFrames: Map<string, HTMLImageElement> = new Map<
    string,
    HTMLImageElement>();
  audioSfx: Map<string, HTMLAudioElement> = new Map<string, HTMLAudioElement>();
  isGameOver: boolean = false;
  frameJumpscare?: HTMLImageElement;

  imageBackground?: HTMLImageElement;

  buttonsImages: { [key: string]: string[] } = {
    forward: ['assets/images/btnf0.png', 'assets/images/btnf1.png'],
    left: ['assets/images/btnl0.png', 'assets/images/btnl1.png'],
    right: ['assets/images/btnr0.png', 'assets/images/btnr1.png'],
    shoot: ['assets/images/btns0.png', 'assets/images/btns1.png'],
    turn: ['assets/images/btnt0.png', 'assets/images/btnt1.png'],
  };
  buttonsImagesCurrent: { [key: string]: string } = {
    forward: this.buttonsImages['forward'][0],
    left: this.buttonsImages['left'][0],
    right: this.buttonsImages['right'][0],
    shoot: this.buttonsImages['shoot'][0],
    turn: this.buttonsImages['turn'][0],
  };
  timeLimit: number = 1000 * 60;
  progress: number = 0;
  timeStart: number = 0;
  buttonsImagesState:  { [key: string]: boolean } = {};

  constructor(
    public router: Router, 
    private route: ActivatedRoute,
    private mazeService: MazeService,
    private httpClient: HttpClient, 
    private serviceSocket : ServiceWebSocketWrapper
  ) {}

  async ngOnInit(): Promise<void> {

    document.documentElement.style.setProperty(
      '--app-bg-color',
      '#d13a52ba'
    );

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

  onQuestionDataRecieved(data: string)
  {
    const jsonData = JSON.parse(data);

    this.timeLimit = jsonData.timeLimit;

    if (this.timeLimit !== -1) {
        this.updateProgress();
    }

    this.imageLoader('assets/scary background.png').then((x: HTMLImageElement) => {
      this.imageBackground = x;
      document.body.style.backgroundImage = `url(${x.src})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
    });

    this.audioSfx.set('step', new Audio('assets/sfx/step.wav'));
    for (let i = 1; i <= 5; i++)
      this.audioSfx.set('scary' + i, new Audio(`assets/sfx/scary${i}.wav`));
    this.audioSfx.set('scream', new Audio('assets/sfx/scream.wav'));
    this.audioSfx.set('gunshot', new Audio('assets/sfx/gunshot.wav'));
    this.audioSfx.set('wrong', new Audio('assets/sfx/wrong.wav'));

    const canvas = this.gridCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    if (this.ctx === undefined) return;

    this.drawFrame = (pos: Pos) => {
      if (this.context === undefined) return;
      if (this.drawMode === 1) {
        this.draw2DFrame(this.ctx, this.context, pos);
      } else {
        this.draw2DGrid(this.ctx, this.context, pos);
      }
    };

    this.imageLoader('assets/aaahhh scary.png').then((x: HTMLImageElement) => {
      this.frameJumpscare = x;
    });

    var c: any = this.ctx;
    this.context = new GameContext(
      this.drawFrame,
      (name) => {
        if (name === 'scream') {
          for (let x of this.audioSfx.values()) {
            x.pause();
            x.currentTime = 0;
          }
        }

        let sound = this.audioSfx.get(name);

        if (sound) {
          sound.autoplay = true;
          sound.pause();
          sound.currentTime = 0;
          let playPromise = sound.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              if (error.name === 'NotAllowedError') {
                console.warn('User interaction required to play audio.');
              } else {
                console.error('Playback error:', error);
              }
            });
          }
        }
      },
      () => {
        if (!this.context) return;
        this.context.stop();
        this.isGameOver = true;
        this.drawFrame(this.context.player.pos);
        setTimeout(() => {
          var x = performance.now() - this.timeStart;
          x /= this.timeLimit;
          this.serviceSocket.sendGameResult(performance.now() - this.timeStart, ((x < 0.5) ? 0 : 0.6));
          this.router.navigate(['/transition-loading/', LoadingWindowType.FINISH_GAME]);
        }, 750);
      },
      (enable: boolean) => {
        this.guiButtonsDisable();
      },
      this.gridCanvas.nativeElement.clientWidth,
      this.gridCanvas.nativeElement.clientHeight
    );

    this.httpClient
      .get('assets/maze.txt', { responseType: 'text' })
      .subscribe((data) => {
        // Load the maze file
        var x = this.mazeService.loadMazeFromString(data);
        if (x !== null && this.context !== undefined) {
          this.context.grid = x;

          this.context.cellSize = Math.min(
            this.gridCanvas.nativeElement.clientWidth / x.cols,
            this.gridCanvas.nativeElement.clientHeight / x.rows
          );

          this.guiButtonsDisable();

          /*var path = DijkstraPathfinding.findPath(
              this.context.grid, 
              GameContext.getTilePos(this.context.enemy.pos, this.context.enemy.orientation), 
              GameContext.getTilePos(this.context.player.pos, this.context.player.orientation));*/

          this.drawFrame(this.context.player.pos);
        } else {
        }
      });
  }

  ngOnDestroy(): void
  {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = 'white';
    this.context?.stop();
    document.documentElement.style.removeProperty(
      '--app-bg-color'
    );
  }

  ngAfterViewInit(): void {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key == 's') {
      this.drawMode += 1;
      if (this.drawMode == 2) this.drawMode = 0;

      if (this.context) this.drawFrame(this.context.player.pos);
    }
    else if (event.key == 'd') {
      this.context?.forceJumpscare();
    }
    console.log('Key pressed:', event.key);
  }

  draw2DFrame(
    ctx: CanvasRenderingContext2D,
    context: GameContext,
    playerPos: Pos
  ): void {
    let path = getFrameTitle(
      context.player,
      context.enemy,
      context.grid,
      playerPos,
      context.walkDir,
      context.timerStepA.isActive(),
      context.timerTurn.isActive()
    );

    if (this.mazeFrames.has(path)) {
      var frame = this.mazeFrames.get(path);
      if (frame) this.drawFrameElement(ctx, frame);
    } else {
      this.imageLoader('assets/' + path).then(
        (x: HTMLImageElement) => {
          this.mazeFrames.set(path, x);
          this.drawFrameElement(ctx, x);
        },
        () => {}
      );
    }
  }

  drawFrameElement(ctx: CanvasRenderingContext2D, frame: HTMLImageElement) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(frame, 0, 0, 400, 640);

    if (this.isGameOver && this.frameJumpscare) {
      ctx.drawImage(this.frameJumpscare, 0, 0, 400, 640);
    }
  }

  imageLoader(src: string): Promise<HTMLImageElement> {
    //console.log(`Loading image via HttpClient: ${src}`);

    return lastValueFrom(
      this.httpClient.get(src, { responseType: 'blob' })
    ).then((blob) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if (blob === undefined || !(blob instanceof Blob)) {
          reject(new Error(`Received invalid blob for image: ${src}`));
          return;
        }

        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          console.log(`Image loaded: ${src}`);
          resolve(img);
        };

        img.onerror = (err) => {
          console.error(`Failed to load image: ${src}`, err);
          reject(err);
        };
      });
    });
  }

  draw2DGrid(
    ctx: CanvasRenderingContext2D,
    context: GameContext,
    playerPos: Pos
  ): void {
    ctx.fillStyle = 'rgb(64,64,64)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    context.grid.nodes.forEach((node: any) => {
      const x = node.pos.x * context.cellSize;
      const y = node.pos.y * context.cellSize;

      // Draw a white rectangle for each node
      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, context.cellSize, context.cellSize);
    });

    QuestionHorrorGameComponent.drawPlayer(
      ctx,
      playerPos,
      context.player.orientation,
      context.cellSize,
      'blue'
    );
    QuestionHorrorGameComponent.drawPlayer(
      ctx,
      context.enemy.pos,
      context.enemy.orientation,
      context.cellSize,
      'red'
    );
  }

  updateProgress() {
    if (this.timeLimit === -1) return;

    const elapsed = performance.now() - this.timeStart;
    this.progress = Math.min(100, (elapsed / this.timeLimit) * 100);

    if (this.progress < 100) {
        requestAnimationFrame(() => this.updateProgress());
    }
}

  static drawPlayer(
    ctx: CanvasRenderingContext2D,
    playerPos: Pos,
    playerOrientation: Pos,
    cellSize: number,
    color: string
  ) {
    ctx.save();

    ctx.translate((cellSize * playerPos.x) / 2, (cellSize * playerPos.y) / 2);
    ctx.rotate(
      -Math.PI / 2 + Math.atan2(playerOrientation.x, -playerOrientation.y)
    );
    ctx.scale(0.5, 0.5);

    ctx.fillStyle = color;
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(-10, 15);
    ctx.lineTo(20, 0);
    ctx.lineTo(-10, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  guiButtonsDisable() {
    var buttonEnable = (x: any, enable: boolean, title: string) => {
      this.buttonsImagesCurrent[title] =
        this.buttonsImages[title][enable ? 1 : 0];
      this.buttonsImagesState[title] = enable;
      //x.nativeElement.style.backgroundColor = enable ? 'white' : 'gray';
    };

    if (!this.context) return;

    let tp = GameContext.getTilePos(
      this.context.player.pos,
      this.context.player.orientation
    );

    buttonEnable(
      this.buttonForward,
      this.context.grid.has(Pos.add(tp, this.context.player.orientation)) && !this.context.isBusy(),
      'forward'
    );

    buttonEnable(
      this.buttonForward,
      this.context.grid.has(
        Pos.add(tp, this.context.player.orientation.copy().rotate90())
      ) && !this.context.isBusy(),
      'left'
    );

    buttonEnable(
      this.buttonRight,
      this.context.grid.has(
        Pos.add(tp, this.context.player.orientation.copy().rotate270()) 
      ) && !this.context.isBusy(),
      'right'
    );

    buttonEnable(
      this.buttonShoot, 
      this.context.bullets > 0 && !this.context.isBusy(),
      "shoot");

    buttonEnable(
      this.buttonRotate,
      !this.context.isBusy(),
      'turn'
    );
  }

  onButtonShootPressed() {
    if (!this.buttonsImagesState["shoot"])
    {
      this.audioSfx.get("wrong")?.play();
      return;
    }
    if (this.context) {
      this.context.shoot();
    }
  }

  onButtonRightPressed() {
    if (!this.buttonsImagesState["right"])
    {
      this.audioSfx.get("wrong")?.play();
      return;
    }
    if (this.context) this.context.moveRight();
  }
  onButtonForwardPressed() {
    if (!this.buttonsImagesState["forward"])
    {
      this.audioSfx.get("wrong")?.play();
      return;
    }
    if (this.context) this.context.moveForward();
  }
  onButtonLeftPressed() {
    if (!this.buttonsImagesState["left"])
    {
      this.audioSfx.get("wrong")?.play();
      return;
    }
    if (this.context) this.context.moveLeft();
  }
  onButtonRotatePressed() {
    if (this.context) this.context.rotate();
  }
}
