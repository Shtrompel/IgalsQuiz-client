

export class Pos {
    public x: number = 0;
    public y: number = 0;
  
    constructor(x?: number, y?: number) {
      if (x !== undefined && y !== undefined) {
        this.x = x;
        this.y = y;
      }
    }
  
    equals(other: Pos): boolean {
      if (this === other) return true;
      return this.x === other.x && this.y === other.y;
    }
  
    hashCode(): number {
      return this.x * 31 + this.y; // Simple hash implementation
    }

    static add(a: Pos, b: Pos): Pos
    {
      return new Pos(a.x + b.x, a.y + b.y);
    }
  
    add(x: number, y: number): Pos;
    add(other: Pos): Pos;
    add(arg1: number | Pos, arg2?: number): Pos {
      if (typeof arg1 === 'number' && arg2 !== undefined) {
        this.x += arg1;
        this.y += arg2;
      } else if (arg1 instanceof Pos) {
        this.x += arg1.x;
        this.y += arg1.y;
      }
      return this;
    }
  
    sub(other: Pos): Pos {
      this.x -= other.x;
      this.y -= other.y;
      return this;
    }
  
    copy(): Pos {
      return new Pos(this.x, this.y);
    }
  
    set(pos: Pos): Pos;
    set(x: number, y: number): Pos;
    set(arg1: number | Pos, arg2?: number): Pos {
      if (arg1 instanceof Pos) {
        this.x = arg1.x;
        this.y = arg1.y;
      } else if (typeof arg1 === 'number' && arg2 !== undefined) {
        this.x = arg1;
        this.y = arg2;
      }
      return this;
    }
  
    mult(scalar: number): Pos {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }
  
    div(scalar: number): Pos {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    }
  
    rotate90(): Pos {
      const newX = this.y;
      const newY = -this.x;
      this.x = newX;
      this.y = newY;
      return this;
    }
  
    rotate180(): Pos {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    }
  
    rotate270(): Pos {
      const newX = -this.y;
      const newY = this.x;
      this.x = newX;
      this.y = newY;
      return this;
    }
  
    distsq(other: Pos): number {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      return dx * dx + dy * dy;
    }

    toJson()
    {
      return {x: this.x, y: this.y};
    }
  
    toString(): string {
      return JSON.stringify(this.toJson());
    }
  }