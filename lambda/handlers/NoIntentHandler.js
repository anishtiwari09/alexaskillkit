const { states, exit_message, conclude_message } = require("../Constants");
const ReviseClassIntentHandler = require("./ReviseClassIntentHandler");
const { stripTags, toMainMenu } = require("../Utils/CommonUtilMethods");
const { searchConcept } = require("../Utils/ChooseConceptMethods");
const NoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.NoIntent"
    );
  },
  handle(handlerInput) {
    var cardContent = "";
    var cardHeader = "beGalileo";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log(sessionAttributes.state);
    var speakOutput = " ";
    if (sessionAttributes.state === states.NOTIFICATION) {
      const updatedIntent = sessionAttributes.callBackIntent;
      console.log(updatedIntent);
      if (updatedIntent == "ReviseClassIntent")
        return ReviseClassIntentHandler.handle(handlerInput);
      else {
        speakOutput += "ok ";
        speakOutput += conclude_message;
        sessionAttributes.state = states.CONCLUDE;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }
    }
    else if (
      sessionAttributes.state === states.IS_STUDENT ||
      sessionAttributes.state === states.CHALLENGE_QUIZ
    ) {
      sessionAttributes.IS_STUDENT = false;
      return toMainMenu(handlerInput);
      // speakOutput = conclude_message;
      // sessionAttributes.state = states.CONCLUDE;
      //  return handlerInput.responseBuilder
      //    .withShouldEndSession(false)
      //    .speak(speakOutput)
      //    .getResponse();
    } else if (sessionAttributes.state === states.CONCLUDE) {
      speakOutput = exit_message;
      return handlerInput.responseBuilder
      .withShouldEndSession(true)
      .speak(speakOutput)
      .getResponse();
    }
    else if (sessionAttributes.state === states.SHARE_SCORE) {
      speakOutput = "Okay " + conclude_message;
      sessionAttributes.state = states.CONCLUDE;
      sessionAttributes.repeat_message = speakOutput;
      return handlerInput.responseBuilder
        .withShouldEndSession(false)
        .speak(speakOutput)
        .getResponse();
    }
    else if (sessionAttributes.state === states.REVISE) {

      return searchConcept(handlerInput);
    }
    else {
      speakOutput = "Okay " + conclude_message;
      sessionAttributes.state = states.CONCLUDE;
      sessionAttributes.repeat_message = speakOutput;
      return handlerInput.responseBuilder
        .withShouldEndSession(false)
        .speak(speakOutput)
        .getResponse();
    }
    sessionAttributes.repeat_message = speakOutput;
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  }
};

module.exports = NoIntentHandler;