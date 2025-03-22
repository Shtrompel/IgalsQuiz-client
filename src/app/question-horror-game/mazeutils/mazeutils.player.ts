import { Pos } from "./mazeutils.pos";

export class Transformation {
    pos: Pos;
    orientation: Pos;

    constructor(pos: Pos, orientation: Pos) {
      this.pos = pos;
      this.orientation = orientation;
    }
  }

export class Player {
    static readonly WALK_DIRECTION_LEFT = 0;
    static readonly WALK_DIRECTION_FRONT = 1;
    static readonly WALK_DIRECTION_RIGHT = 2;
  
    pos: Pos = new Pos(0, 0);
    orientation: Pos = new Pos(0, 0);
    currentNode: Node | null = null;
    nextNode: Node | null = null;
  

  
    constructor(pos: Pos, orientation: Pos) {
      this.pos = pos;
      this.orientation = orientation;
    }
  
    rotate(): void {
      this.orientation.x *= -1;
      this.orientation.y *= -1;
    }
  
    moveA(): void {
      this.pos.add(this.orientation);
    }
  
    unmoveA(): void {
      this.pos.sub(this.orientation);
    }
  
    static moveB(walkType: number, pos: Pos, orientation: Pos): Transformation {
      const newOrientation = orientation.copy();
  
      switch (walkType) {
        case Player.WALK_DIRECTION_LEFT:
          newOrientation.rotate90();
          break;
        case Player.WALK_DIRECTION_RIGHT:
          newOrientation.rotate270();
          break;
      }
  
      return new Transformation(pos.copy().add(newOrientation), newOrientation.copy());
    }
  
    moveB(walkType: number): Transformation {
      return Player.moveB(walkType, this.pos, this.orientation);
    }
  }
  