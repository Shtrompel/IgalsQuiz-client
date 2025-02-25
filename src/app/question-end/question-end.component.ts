
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-question-end',
  templateUrl: './question-end.component.html',
  styleUrl: './question-end.component.css'
})
export class QuestionEndComponent {

  validityState : string = 'Wrong';
  messageTop : string = 'asd';
  message : string = 'asd';
  validable : boolean = true;

  backgroundColor : string = "";

  msgPoints : string = '';
  msgTotalPoints : string = '';
  msgRightAnswer : string = '';
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
    //const jsonData = {"validness": "Right", "points": 500, "totalPoints": 800, "rightAnswer": "The answer was poop", "level": 23};
    this.validityState = jsonData.validness;
    this.validable = jsonData.validable;

    switch (this.validityState)
    {
      case "Right":
        this.backgroundColor = "rgb(0, 255, 0)"
        break;

      case "Partially Right":
        this.backgroundColor = "rgb(255, 255, 0)"
        break;

        case "Wrong":
      default:
        this.backgroundColor = "rgb(255, 0, 0)"
      break;
    }

    document.documentElement.style.setProperty(
      '--app-bg-color',
      this.backgroundColor
    );

    if (this.validable)
      this.messageTop = "You were " + this.validityState + "!";
    else
    {
      if (this.validityState === "Wrong")
        this.messageTop = "Game Over";
      else
        this.messageTop = "Game Complete";
    }

    this.msgPoints = jsonData.points.toString();
    this.msgTotalPoints = jsonData.totalPoints.toString();
    this.msgRightAnswer = jsonData.rightAnswer;


    this.message = "";
    this.message += "You gained " + jsonData.points + "! Now you have " + jsonData.totalPoints + " points.";
    this.message += '\n';
    this.message += jsonData.rightAnswer;

    
    if (jsonData.level % 10 == 1)
      this.msgLevel = jsonData.level.toString() + 'st' ;
    else if (jsonData.level % 10 == 2)
      this.msgLevel = jsonData.level.toString() + 'nd' ;
    else if (jsonData.level % 10 == 3)
      this.msgLevel = jsonData.level.toString() + 'rd' ;
    else
      this.msgLevel = jsonData.level.toString() + 'th' ;
    
  }

  ngOnDestroy()
  {
    document.documentElement.style.removeProperty(
      '--app-bg-color'
    );
  }

}
