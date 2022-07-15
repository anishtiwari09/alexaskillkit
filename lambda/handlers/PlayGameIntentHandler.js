const { states } = require("../Constants");
var cardContent = "";
var cardHeader = "beGalileo";
var sessionAttributes;
var speakOutput = " ";
const { startQuizCricketGame,
  readQuizCricketInstructions,
valuateQuizCricketAnswer } = require("../Utils/QuizCricketGameMethods");

const PlayGameIntentHandler = {
    canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "PlayGameIntent"
    );
  },
  handle(handlerInput) {
      speakOutput = "Do you want to play quiz cricket?";
      sessionAttributes.state = states.GAME_QUIZ_CRICKET;
         sessionAttributes.IS_STUDENT = true;
       return handlerInput.responseBuilder
         .speak(speakOutput)
         .withShouldEndSession(false)
         .getResponse();
  }
};

const GameMenuIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "GameMenuIntent" &&
      (sessionAttributes.state === states.GAME_QUIZ_CRICKET)
    );
  },
  handle(handlerInput) {
    
       const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
       var resolutionsPerAuth =
         handlerInput.requestEnvelope.request.intent.slots["gameMenuOption"]
           .resolutions.resolutionsPerAuthority;

       var optionId = resolutionsPerAuth[0].values[0].value.id;
       var optionValue = resolutionsPerAuth[0].values[0].value.name;
       speakOutput = "Start game or read instructions "+optionValue;
       if(optionId == 0)
          return startQuizCricketGame(handlerInput);
        else
          return readQuizCricketInstructions(handlerInput);  
  
  }
};

const NumbersIntentHandler = {
  canHandle(handlerInput) {
     const request = handlerInput.requestEnvelope.request;
     sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "NumbersIntent" &&
      (sessionAttributes.state === states.GAME_QUIZ_CRICKET)
    );
  },
  handle(handlerInput) {
   var speakOutput = "";
   var intent = handlerInput.requestEnvelope.request.intent;
   var numValue = intent.slots['myValue'].value;
    console.log(numValue);
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if(sessionAttributes.state === states.GAME_QUIZ_CRICKET)
        return valuateQuizCricketAnswer(handlerInput,numValue);
   
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

module.exports = {
  PlayGameIntentHandler,
  GameMenuIntentHandler,
  NumbersIntentHandler
};
