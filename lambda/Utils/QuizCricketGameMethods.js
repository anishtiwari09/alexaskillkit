var cardContent = "";
var cardHeader = "beGalileo";
var speakOutput = "";
const{ states,sub_states,option_help_message } = require("../Constants");
const Constants  = require("../Constants");
const { singleDigitRandomNumber,twoDigitRandomNumber } = require("../Utils/CommonUtilMethods");

function openQuizCricketGame(handlerInput){
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    speakOutput = "You can say Start Game or Read Instructions";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
}

function startQuizCricketGame(handlerInput){
   const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
     sessionAttributes.IS_STUDENT = true;
   sessionAttributes.sub_state = sub_states.GAME_RESUME;
    speakOutput =
      'Starting Quiz Cricket Game <break time="1s"/>You are in Level 1 <break time="0.3s"/>Mohammed Shami Over <break time="0.3s"/>You have to score 20 out of 6 balls <break time="0.3s"/>';
    
    speakOutput += '<break time = "0.5s"/>';
    sessionAttributes.quiz_cricket_question_count = 0;
    sessionAttributes.quiz_cricket_score = 0;
    speakOutput +=  getQuizCricketQuestion(handlerInput);
      return handlerInput.responseBuilder
    .speak(speakOutput)
    .withShouldEndSession(false)
    .getResponse();
}

function getQuizCricketQuestion(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var speakOutput = "";
  var number1 = singleDigitRandomNumber();
  var number2 = singleDigitRandomNumber();
  var answer = number1+number2;
  sessionAttributes.quiz_cricket_right_answer = "a";
  var questionWeight = getQuizCricketQuestionWeight(
    sessionAttributes.quiz_cricket_question_count
  );
  sessionAttributes.quiz_cricket_question_weight = questionWeight;
  speakOutput += "Here comes the"
  speakOutput += questionWeight +' run question <break time="0.5s"/>';
  speakOutput += 'What is '+number1+' plus '+number2+"?";
  speakOutput +=
    '<break time="0.5s"/> Option <say-as interpret-as="spell-out">A</say-as> ' +
    answer;
  speakOutput +=
    '<break time="0.5s"/> Option <say-as interpret-as="spell-out">B</say-as> ' +
    (answer + 2);
  sessionAttributes.repeat_message = speakOutput;
  sessionAttributes.help_message = option_help_message;
  return speakOutput;
}

function getQuizCricketQuestionWeight(index)
{
  var level_1 = [1,1,2,4,4,2];
  return level_1[index];
}

function valuateQuizCricketAnswer(handlerInput,userAnswer)
{
    var speakOutput = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var quizCount = sessionAttributes.quiz_cricket_question_count
     if (sessionAttributes.quiz_cricket_right_answer == userAnswer)
     {
       
        sessionAttributes.quiz_cricket_score +=
          sessionAttributes.quiz_cricket_question_weight;
        speakOutput += "Wow! ";
        speakOutput += getNamesForRuns(
          sessionAttributes.quiz_cricket_question_weight
        );
        console.log("Score " + sessionAttributes.quiz_cricket_score);
     }
     else 
        speakOutput += "OOps! you missed the ball ";
    
     if(quizCount<5)
    {
        quizCount++;
        sessionAttributes.quiz_cricket_question_count = quizCount;
        speakOutput += '<break time="0.5s"/> ';
        speakOutput += getQuizCricketQuestion(handlerInput);
       
    }
    else
    {
      var userScore = sessionAttributes.quiz_cricket_score;
      sessionAttributes.sub_state = sub_states.GAME_OVER;
      if(userScore>=6)
      {
          speakOutput +=
            '<break time="0.5s"/> Over completed <break time="0.5s"/> you scored ' +
            userScore +
            ' <break time="0.5s"/> and unlocked level 2 <break time="0.5s"/> Do you want to take level 2';
        
      }
      else
      {
        speakOutput +=
          '<break time="0.5s"/> Over completed <break time="0.5s"/> you scored ' +
          userScore +
          ' <break time="0.5s"/> your score is too low <break time="0.5s"/> Do you want training or <break time="0.5s"/> you wan to try again?';
        speakOutput += 'you can say training or try again';  
      }
      sessionAttributes.help_message = Constants.yes_or_no_help_message;
    }
  
    sessionAttributes.repeat_message = speakOutput;
     return handlerInput.responseBuilder
       .speak(speakOutput)
       .withShouldEndSession(false)
       .getResponse();   
}
function getNamesForRuns(runValue)
{
  switch(runValue)
  {
    case 1:
      return "Its a single ";
    case 2:
      return "Its a two ";
     case 4:
       return "Its a boundary ";
     case 6:
       return "Its a Sixer ";     
  }

}

function readQuizCricketInstructions(handlerInput){
    speakOutput = "Here is the instructions.Each level has 6 questions.Every question contains various scores";
     return handlerInput.responseBuilder
       .speak(speakOutput)
       .withShouldEndSession(false)
       .getResponse();
}

module.exports = {
    openQuizCricketGame,
    startQuizCricketGame,
    readQuizCricketInstructions,
    valuateQuizCricketAnswer
}