import { Grid } from "./mazeutile.grid";
import { Pos } from "./mazeutils.pos";


export class DijkstraPathfinding {

  static findPath(grid: Grid, start: Pos, target: Pos): Pos[] {
    if (!grid.has(start) || !grid.has(target)) {
      return []; // No path if start or target is invalid
    }
  
    const distances = new Map<string, number>();
    const previous = new Map<string, Pos>();
    const queue: Pos[] = [];
  
    for (const key of grid.nodes.keys()) {
      distances.set(key, Infinity);
    }
    distances.set(DijkstraPathfinding.toKey(start), 0);
    queue.push(start);
  
    while (queue.length > 0) {
      queue.sort((a, b) => (distances.get(DijkstraPathfinding.toKey(a))! - distances.get(DijkstraPathfinding.toKey(b))!));
      const current = queue.shift()!;
  
      if (current.x === target.x && current.y === target.y) {
        return DijkstraPathfinding.reconstructPath(previous, target);
      }
  
      const currentNode = grid.get(current);
      if (!currentNode) continue;
  
      for (const neighbor of currentNode.neighbors) {
        if (!neighbor) continue;
  
        const neighborPos = { ...neighbor.pos };
        const newDist = distances.get(DijkstraPathfinding.toKey(current))! + 1;
  
        if (newDist < (distances.get(DijkstraPathfinding.toKey2(neighborPos)) ?? Infinity)) {
          distances.set(DijkstraPathfinding.toKey2(neighborPos), newDist);
          previous.set(DijkstraPathfinding.toKey2(neighborPos), current);
          var p = new Pos(neighborPos.x, neighborPos.y);
          queue.push(p);
        }
      }
    }
  
    return []; // No path found
  }
  
  static reconstructPath(previous: Map<string, Pos>, target: Pos): Pos[] {
    const path: Pos[] = [];
    for (let at: Pos | undefined = target; at !== undefined; at = previous.get(DijkstraPathfinding.toKey(at))) {
      path.push(at);
    }
    path.reverse();
    return path;
  }

  static toKey(pos: Pos): string {
    return `${pos.x},${pos.y}`;
  }

  static toKey2(pos:  {
    x: number;
    y: number;}) {
      return `${pos.x},${pos.y}`;
    }
}
  

class PriorityQueue<T> {
  private data: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  add(item: T): void {
    this.data.push(item);
    this.data.sort(this.comparator);
  }

  poll(): T | undefined {
    return this.data.shift();
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }
}