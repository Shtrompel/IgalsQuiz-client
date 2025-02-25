
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrl: './game-end.component.css'
})
export class GameEndComponent {

  msgTotalPoints : string = '';
  msgLevel : string = '1st';

  constructor(public router: Router, private route: ActivatedRoute)
  {
  }

  ngOnInit()
  {
    let data = this.route.snapshot.paramMap.get('data');
    if (data === null || data === "")
      return;

    const jsonData = JSON.parse(data);

    this.msgTotalPoints = jsonData.totalPoints.toString();
    
    if (jsonData.level % 10 == 1)
      this.msgLevel = jsonData.level.toString() + 'st' ;
    else if (jsonData.level % 10 == 2)
      this.msgLevel = jsonData.level.toString() + 'nd' ;
    else if (jsonData.level % 10 == 3)
      this.msgLevel = jsonData.level.toString() + 'rd' ;
    else
      this.msgLevel = jsonData.level.toString() + 'th' ;
    
  }

}
