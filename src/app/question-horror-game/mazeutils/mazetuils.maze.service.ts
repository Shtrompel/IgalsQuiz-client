import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Grid } from './mazeutile.grid';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MazeService {

  loadMazeFromString(fileContent: string): Grid {
    // Split the content into lines
    const lines = fileContent.split('\n');
    const rows = lines.length;
    const cols = lines[0].length;

    // Parse the maze data
    const maze: number[][] = [];
    for (let y = 0; y < rows; y++) {
      maze[y] = [];
      for (let x = 0; x < cols; x++) {
        maze[y][x] = parseInt(lines[y].charAt(x), 10);
      }
    }

    // Create and return the grid
    return Grid.fromBinaryData(maze);
  }
}