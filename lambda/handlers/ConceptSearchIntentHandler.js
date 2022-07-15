const { searchConcept } = require("../Utils/ChooseConceptMethods");
const { getLastTopic } = require("../Utils/HttpUtils");
const { checkSupportedDisplay } = require("../Utils/CommonUtilMethods");
const constants = require("../Constants");

const ConceptQuizSearchIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "ConceptQuizSearchIntent"
    );
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if (!checkSupportedDisplay(handlerInput)) {
      var speechText = Constants.quiz_video_not_supported_message;
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(false)
        .getResponse();
    }

    sessionAttributes.state = constants.states.QUIZ;
    sessionAttributes.page = 0;
      return searchConcept(handlerInput);
  }
};
const ConceptVideoSearchIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "ConceptVideoSearchIntent"
    );
  },
  handle(handlerInput) {
                         
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

         if (!checkSupportedDisplay(handlerInput)) {
            var speechText = Constants.quiz_video_not_supported_message;
            return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
        }

          sessionAttributes.state = constants.states.VIDEO;
          sessionAttributes.page = 0;
          return searchConcept(handlerInput);
      }
};
 const BedTimeSummaryIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "BedTimeSummaryIntent"
    );
  },
  async handle(handlerInput) {
    var speechText = "";
    var searchTerm = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.state = constants.states.REVISE;
    sessionAttributes.page = 0;

     if (
       typeof handlerInput.requestEnvelope.request.intent.slots.raw_input
         .value != "undefined"
     ) {
       searchTerm =
         handlerInput.requestEnvelope.request.intent.slots.raw_input.value;
       return searchConcept(handlerInput);

     } else {
          var dataResponse = await getLastTopic(sessionAttributes.student_id); 
          if(dataResponse.status)
          {
             return searchConcept(handlerInput);
             
            speechText = "Do you want to revise your last lesson";
            return handlerInput.responseBuilder
              .speak(speechText)
              .withShouldEndSession(false)
              .getResponse();
          }
          else{

                return searchConcept(handlerInput);
          }
       
     }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  }
};
module.exports = {
  ConceptQuizSearchIntentHandler,
  ConceptVideoSearchIntentHandler,
  BedTimeSummaryIntentHandler
};