import { Grid } from './mazeutile.grid';
import { GameContext } from './mazeutils.maze.gamecontext';
import { Player } from './mazeutils.player';
import { Pos } from './mazeutils.pos';

export class IntersectionState {
  private wallConfig: boolean[]; // [left, front, right]
  private enemyPos: string;
  private stand: HTMLImageElement | null = null;
  private walk: Map<string, HTMLImageElement> = new Map();
  private turn: HTMLImageElement | null = null;

  constructor(wallConfig: boolean[], enemyPos: string) {
    if (wallConfig.length !== 3) {
      throw new Error('wallConfig must have exactly 3 elements.');
    }
    this.wallConfig = [...wallConfig];
    this.enemyPos = enemyPos;
  }
  /*
    async getFrame(): Promise<HTMLImageElement> {
      if (!this.stand) {
        this.stand = await this.imageLoader(this.getFileName());
      }
      return this.stand;
    }
  
    async getWalkFrame(direction: string): Promise<HTMLImageElement> {
      if (!this.walk.has(direction)) {
        this.walk.set(direction, await this.imageLoader(this.getWalkingFileName(direction)));
      }
      return this.walk.get(direction)!;
    }
  
    async getTurnFrame(): Promise<HTMLImageElement> {
      if (!this.turn) {
        this.turn = await this.imageLoader(this.getTurnFileName());
      }
      return this.turn;
    }
  */
  getFileName(): string {
    return `frames/${this.getWallConfigString()}-${this.enemyPos}.png`;
  }

  getWalkingFileName(direction: string): string {
    return `frames/${this.getWallConfigString()}-${this.enemyPos
      } walk ${direction}.png`;
  }

  getTurnFileName(): string {
    return `frames/${this.fullWallConfigString()}-${this.enemyPos} turn.png`;
  }

  private b2s(b: boolean): string {
    return b ? 'True' : 'False';
  }

  private fullWallConfigString(): string {
    return '(True, True, True)';
  }

  private getWallConfigString(): string {
    return `(${this.b2s(this.wallConfig[0])}, ${this.b2s(
      this.wallConfig[1]
    )}, ${this.b2s(this.wallConfig[2])})`;
  }

  equals(other: IntersectionState): boolean {
    return (
      this.enemyPos === other.enemyPos &&
      this.wallConfig.every((val, idx) => val === other.wallConfig[idx])
    );
  }

  toString(): string {
    return `IntersectionState{ wallConfig=${this.getWallConfigString()}, enemyPos='${this.enemyPos
      }' }`;
  }
}

function getTilePos(p: Pos, o: Pos): Pos {
  return new Pos(Math.floor(p.x / 2), Math.floor(p.y / 2));
}

export function getNodeAvailable(
  grid: Grid,
  pos: Pos,
  orientation: Pos
): boolean {
  return grid.has(pos.copy().add(orientation));
}

export function getFrameTitle(
  player: Player,
  enemy: Player,
  grid: Grid,
  oldPos: Pos,
  walkDir: number,
  walking: boolean,
  turning: boolean
): string {
  const pos = GameContext.getTilePos(player.pos, player.orientation);
  const node = grid.get(pos);
  if (!node) return '';

  const state = [
    getNodeAvailable(grid, pos, player.orientation.copy().rotate90()),
    getNodeAvailable(grid, pos, player.orientation.copy()),
    getNodeAvailable(grid, pos, player.orientation.copy().rotate270()),
  ];

  let enemyState = 'none';

  let p = oldPos.copy().add(player.orientation);
  if (p.equals(enemy.pos)) enemyState = 'front';
  p.add(player.orientation);
  if (p.equals(enemy.pos)) enemyState = 'middle';
  p.add(player.orientation);
  if (p.equals(enemy.pos)) enemyState = 'standingfront';
  p.add(player.orientation);
  if (p.equals(enemy.pos)) enemyState = 'nearfront';
  p.add(player.orientation);
  if (p.equals(enemy.pos)) enemyState = 'awayfront';


  p = oldPos.copy().add(player.orientation);
  p.add(player.orientation.copy().rotate90());
  if (p.equals(enemy.pos)) enemyState = 'standingleft';
  p.add(player.orientation.copy().rotate90());
  if (p.equals(enemy.pos)) enemyState = 'nearleft';
  p.add(player.orientation.copy().rotate90());
  if (p.equals(enemy.pos)) enemyState = 'awayleft';

  p = oldPos.copy().add(player.orientation);
  p.add(player.orientation.copy().rotate270());
  if (p.equals(enemy.pos)) enemyState = 'standingright';
  p.add(player.orientation.copy().rotate270());
  if (p.equals(enemy.pos)) enemyState = 'nearright';
  p.add(player.orientation.copy().rotate270());
  if (p.equals(enemy.pos)) enemyState = 'awayright';


  let istate = new IntersectionState(state, enemyState);

  if (walking && walkDir >= 0) {
    return istate.getWalkingFileName(['left', 'front', 'right'][walkDir]);
  } else if (turning) {
    return istate.getTurnFileName();
  }
  return istate.getFileName();
}

/*
export async function getFrame(
    imageLoader: (src: string) => Promise<HTMLImageElement>,
    player: Player, 
    enemy: Player, 
    grid: Grid, 
    oldPos: Pos,
    mazeFrames: Map<string, IntersectionState>,
    walkDir: number, 
    walking: boolean, 
    turning: boolean
  ): Promise<HTMLImageElement | null> {
    const pos = GameContext.getTilePos(player.pos, player.orientation);
    const node = grid.get(pos);
    if (!node) return null;
  
    const state = [
      getNodeAvailable(grid, pos, player.orientation.copy().rotate90()),
      getNodeAvailable(grid, pos, player.orientation.copy()),
      getNodeAvailable(grid, pos, player.orientation.copy().rotate270()),
    ];
  
    let enemyState = "none";
    let p = oldPos.copy().add(player.orientation);
    if (p.equals(enemy.pos)) enemyState = "front";
    
    p.add(player.orientation);
    if (p.equals(enemy.pos)) enemyState = "middle";
    p.add(player.orientation);
    if (p.equals(enemy.pos)) enemyState = "standingfront";
    p.add(player.orientation);
    if (p.equals(enemy.pos)) enemyState = "nearfront";
    p.add(player.orientation);
    if (p.equals(enemy.pos)) enemyState = "awayfront";
  
    p = oldPos.copy().add(player.orientation.copy().rotate90());
    if (p.equals(enemy.pos)) enemyState = "standingleft";
    p.add(player.orientation.copy().rotate90());
    if (p.equals(enemy.pos)) enemyState = "nearleft";
    p.add(player.orientation.copy().rotate90());
    if (p.equals(enemy.pos)) enemyState = "awayleft";
  
    p = oldPos.copy().add(player.orientation.copy().rotate270());
    if (p.equals(enemy.pos)) enemyState = "standingright";
    p.add(player.orientation.copy().rotate270());
    if (p.equals(enemy.pos)) enemyState = "nearright";
    p.add(player.orientation.copy().rotate270());
    if (p.equals(enemy.pos)) enemyState = "awayright";
  
    const stateKey = JSON.stringify({ state, enemyState });
    let istate = mazeFrames.get(stateKey);
    if (!istate) {
      istate = new IntersectionState(imageLoader, state, enemyState);
      mazeFrames.set(stateKey, istate);
    }
  
    if (walking && walkDir >= 0) {
      return await istate.getWalkFrame(["left", "front", "right"][walkDir]);
    } else if (turning) {
      return await istate.getTurnFrame();
    }
    return await istate.getFrame();
  }
  */
