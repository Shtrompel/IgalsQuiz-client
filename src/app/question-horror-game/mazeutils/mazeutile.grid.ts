import { Pos } from "./mazeutils.pos";

  
  export class Node {
    neighbors: (Node | null)[] = [null, null, null, null];
    pos: Pos = new Pos(0, 0);
  }
  
  export class Grid {
    public static readonly DIRS: number[][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  
    public cols: number;
    public rows: number;
    public nodes: Map<string, Node> = new Map<string, Node>();
  
    constructor(cols: number, rows: number, nodes: Map<string, Node>) {
      this.cols = cols;
      this.rows = rows;
      this.nodes = nodes;
    }
  
    has(pos: Pos): boolean {
      return this.nodes.has(JSON.stringify({x: pos.x, y: pos.y}));
    }
  
    get(pos: Pos): Node | undefined {
      return this.nodes.get(JSON.stringify(({x: pos.x, y: pos.y})));
    }
  
    static fromBinaryData(binaryData: number[][]): Grid {
      const nodes: Map<string, Node> = 
        new Map<string, Node>();
      const rows = binaryData.length;
      const cols = binaryData[0].length;

  
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (binaryData[y][x] === 0) {
            const node = new Node();
            node.pos = new Pos(x, y);
           
            nodes.set(JSON.stringify({x:x, y:y}), node);
          }
        }
      }
  
      for (const node of nodes.values()) {
        for (let i = 0; i < Grid.DIRS.length; i++) {
          const x1 = node.pos.x + Grid.DIRS[i][0];
          const y1 = node.pos.y + Grid.DIRS[i][1];
          const newPos = new Pos(x1, y1);
          const newPosKey = {x: x1, y: y1};
  
          if (nodes.has(JSON.stringify(newPosKey)) && binaryData[y1][x1] === 0) {
            node.neighbors[i] = nodes.get(JSON.stringify(newPosKey))!;
          }
        }
      }
  
      return new Grid(rows, cols, nodes);
    }
  }