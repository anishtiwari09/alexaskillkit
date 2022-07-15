const { states,conclude_message } = require("../Constants");
const { playVideo,reviseLastConceptSummary } = require("./ChooseOptionMethods");
const {
  studentQuizChallenge,
  stripTags,
  toMainMenu
} = require("../Utils/CommonUtilMethods");
const { ChooseSubConcept } = require("./../Utils/ChooseSubConceptMethod"); 
const { searchConcept } = require("./../Utils/ChooseConceptMethods"); 
const { shareQuizToParents } = require("../Utils/HttpUtils");
var mHandlerInput;
 var cardContent = "";
 var cardHeader = "beGalileo";
var sessionAttributes;
 var speakOutput = " ";
 const { openQuizCricketGame } = require("../Utils/QuizCricketGameMethods");




const YesIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
      mHandlerInput = handlerInput;
      sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      var state = sessionAttributes.state;
      if (state === states.VIDEO){
       // return playVideo(mHandlerInput);
        return searchConcept(handlerInput);
      } 
      else if (state === states.CHALLENGE_QUIZ)
        return studentQuizChallenge(mHandlerInput);
      else if (state === states.NOTIFICATION) {
        speakOutput +=
          "you have a quiz challenge from your parent. <break time='200ms'/> do you want to take the challenge? ";
        cardContent +=
          "You have a quiz challenge from your parent.\r\nDo you want to take the challenge? ";
      } else if (state === states.IS_STUDENT) {
        sessionAttributes.IS_STUDENT = true;
        return toMainMenu(mHandlerInput);
      } 
      else if (state === states.SHARE_SCORE) {
        console.log(
          "Parent " +
            sessionAttributes.parent_id +
            " Student Id " +
            sessionAttributes.student_id
        );
        console.log(
          "SubConceptId " +
            sessionAttributes.sub_concept_id +
            " Score " +
            sessionAttributes.quiz_score
        );
        let dataResponse =  shareQuizToParents(
          sessionAttributes.parent_id,
          sessionAttributes.student_id,
          sessionAttributes.sub_concept_id,
          sessionAttributes.quiz_score
        );
        console.log(dataResponse);
        speakOutput += "Score shared with your parent";
        speakOutput += " "+conclude_message;
        sessionAttributes.state = states.CONCLUDE;
      }
      else if(state === states.CONCLUDE)
      {
        return toMainMenu(handlerInput);
      }

      else if(state === states.GAME_QUIZ_CRICKET)
      {
        return openQuizCricketGame(handlerInput);
      }
      else if(state === states.REVISE){
          return reviseLastConceptSummary(handlerInput);
      }

      else {
         return toMainMenu(handlerInput);
      }
      sessionAttributes.repeat_message = speakOutput;
      return mHandlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
    
  }
};


module.exports = YesIntentHandler;