
interface QuestionBase
{

    questionType : string;
    title : string;
    description : string;

    randomize : boolean;
    points : number;
    timeLimit : number;
}

interface Choice
{
     text : string;
     isRight : boolean;
     order : number;

    //Image image;
    //Media sound;
}

interface QuestionChoice extends QuestionBase
{
    choices : Array<Choice>;
}