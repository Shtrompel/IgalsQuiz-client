import { Grid } from './mazeutile.grid';
import { MazeService } from './mazetuils.maze.service';
import { Player, Transformation } from './mazeutils.player';
import { Pos } from './mazeutils.pos';
import { DijkstraPathfinding } from './mazeutils.dijkstra.pathfinding';
import { GameTimer } from './mazeutils.game.timer';

var timeWalk = 300,
  timeEnemyMove = 500,
  timeTurn = 150;
var timeEnemyStun = 3000;

export class GameContext {

  updateFrame: (playerPos: Pos) => void;
  playSound: (name: string) => void;
  gameEnd: () => void;
  updateGui: (enable: boolean) => void;

  grid!: Grid;
  cellSize: number = 20;

  gameTimeStart: number = 0;

  player: Player = new Player(new Pos(15, 32), new Pos(0, -1)); // new Pos(16, 35), new Pos(-1, 0)
  enableWalkBool: boolean = true;
  // new Pos(15, 31), new Pos(0, 1)
  // new Pos(35, 17), new Pos(0, -1)
  enemy: Player = new Player(new Pos(35, 17), new Pos(0, -1));
  walkDir: number = -1;

  screenWidth: number = 0;
  screenHeight: number = 0;

  enemySkipTurn: boolean = false;
  enemyLastOrientation: Pos = new Pos(0, 0);
  enemyPath: Pos[] = [];
  enemyPathFollower = 0;

  bullets: number = 3;

  timerStepA!: GameTimer;
  timerStepB!: GameTimer;
  timerEnemyStep!: GameTimer;
  timerEnemyStun!: GameTimer;
  timerTurn!: GameTimer;

  constructor(
    updateFrame: (pos: Pos) => void,
    playSound: (name: string) => void,
    gameEnd: () => void,
    updateGui: (enable: boolean) => void,
    screenWidth: number,
    screenHeight: number
  ) {
    this.updateFrame = updateFrame;
    this.playSound = playSound;
    this.gameEnd = gameEnd;
    this.updateGui = updateGui;


    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.timerStepA = new GameTimer(() => {
      let newPos = this.player.moveB(this.walkDir);

      if (
        this.grid.has(GameContext.getTilePos(newPos.pos, newPos.orientation))
      ) {
        this.player.pos.set(newPos.pos);
        this.player.orientation.set(newPos.orientation);
      } else {
        this.player.unmoveA();
      }

      this.timerStepA.stop();
      this.updateFrame(this.player.pos);
      this.timerStepB.start();
      this.playSound('step');
    }, timeWalk);

    this.timerStepB = new GameTimer(() => {
      this.timerStepB.stop();
      this.walkDir = -1;
      this.updateGui(true);
    }, timeWalk);

    this.timerEnemyStun = new GameTimer(() => {
      this.timerEnemyStun.stop();
    }, timeEnemyStun);

    this.timerEnemyStep = new GameTimer(() => {
      if (this.player.pos.distsq(this.enemy.pos) <= 0)
      {
        this.playSound("scream");
        this.gameEnd();
        return;
      }
      else
      {
        this.enemyStep();

        let t = Date.now() - this.gameTimeStart;
        t = (1 - ( t / (1000*60*3))) * 800 + 200;
        t  = Math.max(Math.min(t, 1000), 300);
        this.timerEnemyStep.len = t / 2;

        this.timerEnemyStep.start();
      }
    }, timeEnemyMove);

    this.timerTurn = new GameTimer(() => {
      this.playSound('step');
      this.timerTurn.stop();
      this.timerStepB.start();
      this.updateFrame(this.player.pos);
      this.updateGui(true);
    }, timeTurn);

    this.timerEnemyStep.start();

    this.gameTimeStart = Date.now();
  }

  stop()
  {
    this.timerStepA.stop();
    this.timerStepB.stop();
    this.timerEnemyStep.stop();
    this.timerEnemyStun.stop();
    this.timerTurn.stop();
  }

  playerWalk(walk: number) {
    if (
      this.timerStepA.isActive() ||
      this.walkDir >= 0 ||
      this.timerTurn.isActive()
    )
      return;

    this.walkDir = walk;

    var oldPos = this.player.pos.copy();
    this.player.moveA();

    this.timerStepA.start();
    var newPos = this.player.moveB(this.walkDir);
    if (this.grid.has(GameContext.getTilePos(newPos.pos, newPos.orientation))) {
      this.updateFrame(oldPos);
    }
    this.disableWalk();
    this.playSound('step');
    this.updateGui(false);
  }

  enemyStep(): void {

    if (this.timerEnemyStun.isActive())
    {
      return;
    }

    if (this.enemySkipTurn) {
      this.enemySkipTurn = false;
      return;
    }

    let posEnemy: Pos = GameContext.getTilePos(
      this.enemy.pos,
      this.enemy.orientation
    );


    // If the path to player has not been set yet, make one
    if (!this.enemyPath || this.enemyPathFollower >= this.enemyPath.length) {
      console.log(!!this.enemyPath + ", " + this.enemyPathFollower + ", " + this.enemyPath.length);

      this.findPath(false);
    }

    // Advance to the next node
    while (
      this.enemyPathFollower < this.enemyPath.length &&
      this.enemyPath[this.enemyPathFollower].x === posEnemy.x &&
      this.enemyPath[this.enemyPathFollower].y === posEnemy.y
    ) {
      this.enemyPathFollower++;
    }

    // Update position
    var nextPos = Pos.add(this.enemy.pos, this.enemy.orientation);
    var nextTPos = GameContext.getTilePos(
      nextPos,
      this.enemy.orientation);
    if (this.grid.has(nextTPos))
    {
      this.enemy.pos = nextPos;
    }

    // Change the orientation if needed
    if (this.enemyPathFollower < this.enemyPath.length) {
      this.enemyLastOrientation = this.enemyPath[this.enemyPathFollower]
        .copy()
        .sub(posEnemy);
    }

    // If need to turn around, do it and wait a second
    const orientation = this.enemyLastOrientation;
    if (
      (orientation.x === 0 || orientation.y === 0) &&
      (this.enemy.pos.x % 2 == 1 && this.enemy.pos.y % 2 == 1 ) &&
      (!orientation.equals(this.enemy.orientation))
    ) {
      this.enemy.orientation.set(orientation);
      this.enemySkipTurn = true;
    }

    // In intersections, update to a new path
    posEnemy = GameContext.getTilePos(this.enemy.pos, this.enemy.orientation);
    var currentNode = this.grid.get(posEnemy);
    if (currentNode && currentNode.neighbors.length > 2 
      && (this.enemy.pos.x % 2 === 1 && this.enemy.pos.y % 2 === 1)
      ) 
    {
        this.findPath(true);
    }

    // Update the frame data
    this.updateFrame(this.player.pos);

    // Play sounds
    let dist = Math.sqrt(this.player.pos.distsq(this.enemy.pos));
    let x = Math.pow(10, -dist / 8);
    if (Math.random() < x) {
      let n = ['scary1', 'scary2', 'scary3', 'scary4', 'scary5'][
        Math.floor(Math.random() * 5)
      ];
      this.playSound(n);
    }
    
  }

  findPath(enableRandom: boolean) {
    var posEnemy = GameContext.getTilePos(
      this.enemy.pos,
      this.enemy.orientation
    );
    var posPlayer = new Pos();
    if ((Math.random() > 0.1 || !enableRandom)) 
    {
      posPlayer = GameContext.getTilePos(
        this.player.pos,
        this.player.orientation
      );
      // half assed bug fix, when player peeks through corridor enemy thinks
      // the player is in the middle, and cant get into the plauer
      if (Math.random() > 0.5)
        posPlayer = GameContext.getTilePos(
          this.player.pos,
          this.player.orientation.copy().rotate180()
        );
    } else {
      var pos = new Pos(-1, -1);
      while (!this.grid.has(pos))
        pos = new Pos(
          Math.floor(Math.random() * this.grid.cols),
          Math.floor(Math.random() * this.grid.rows)
        );
      posPlayer = pos;
    }

    this.enemyPath = DijkstraPathfinding.findPath(
      this.grid,
      posEnemy,
      posPlayer
    );
    this.enemyPathFollower = 0;
  }

  enableWalk() {
    this.enableWalkBool = true;
  }

  disableWalk() {
    this.enableWalkBool = false;
  }

  shoot() {
    if (this.bullets <= 0)
      return;

    this.playSound('gunshot');

    this.bullets -= 1;
    
    let posEnemy = GameContext.getTilePos(this.enemy.pos, this.enemy.orientation);
    let posPlayer = GameContext.getTilePos(this.player.pos, this.player.orientation);
    while (this.grid.has(posPlayer))
    {
      if (posEnemy.equals(posPlayer))
      {
        this.timerEnemyStun.start();
        break;
      }
      posPlayer.add(this.player.orientation);
    }

    this.updateGui(true);

  }

  forceJumpscare()
  {
    this.enemy.pos.set(this.player.pos);
  }

  moveRight() {
    this.playerWalk(Player.WALK_DIRECTION_RIGHT);
  }

  moveForward() {
    this.playerWalk(Player.WALK_DIRECTION_FRONT);
  }

  moveLeft() {
    this.playerWalk(Player.WALK_DIRECTION_LEFT);
  }

  rotate() {
    this.player.rotate();
    this.timerTurn.start();
    this.updateFrame(this.player.pos);
    this.playSound('step');
    this.updateGui(false);
  }

  isBusy(): boolean {
    return this.timerStepA.isActive() || this.timerStepB.isActive() || this.timerTurn.isActive();
  }

  static getTilePos(p: Pos, o: Pos): Pos {
    var x = o.x >= 0 ? p.x / 2 : (p.x - 1) / 2;
    var y = o.y >= 0 ? p.y / 2 : (p.y - 1) / 2;
    return new Pos(Math.floor(x), Math.floor(y));
  }
}
