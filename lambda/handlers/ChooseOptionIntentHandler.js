const {
  playVideo,
  highlights,
  sendingHIFI,
  challengeQuiz
} = require("./ChooseOptionMethods");
const QuizStartIntentHandler = require("../handlers/QuizStartIntentHandler");
const Constants = require("../Constants");
const { searchConcept } = require("../Utils/ChooseConceptMethods");
const ChooseOptionIntentHandler = {

  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "ChooseOptionIntent"
    );
  },
  handle(handlerInput) {
    var resolutionsPerAuth =
      handlerInput.requestEnvelope.request.intent.slots["chooseOption"]
        .resolutions.resolutionsPerAuthority;

    var optionId = resolutionsPerAuth[0].values[0].value.id;
    var optionName = resolutionsPerAuth[0].values[0].value.name;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log("Page ", sessionAttributes.page, " State ", sessionAttributes.state)
    //  var studentId = sessionAttributes.student_id;
    // var subConceptId = sessionAttributes.sub_concept_id;
    //  var speechOutput = " " + studentId + " " + subConceptId;
    if (optionId == 0) {
      if (sessionAttributes.state == Constants.states.REVISE) {
        sessionAttributes.state = Constants.states.QUIZ;
        return QuizStartIntentHandler.handle(handlerInput);
      }
      else {
        if (sessionAttributes.state == Constants.states.VIDEO)
          sessionAttributes.page = 0;
        sessionAttributes.state = Constants.states.QUIZ;
        return searchConcept(handlerInput);
      }

      //return QuizStartIntentHandler.handle(handlerInput);
    }
    if (optionId == 1) {
      if (sessionAttributes.state == Constants.states.REVISE) {
        sessionAttributes.state = Constants.states.QUIZ;

        return playVideo(handlerInput);
      } else {
        if (sessionAttributes.state == Constants.states.QUIZ)
          sessionAttributes.page = 0;
        sessionAttributes.state = Constants.states.VIDEO;
        return searchConcept(handlerInput);
      }


    }
    if (optionId == 2) return highlights(handlerInput);
    if (optionId == 3) return challengeQuiz(handlerInput);
    if (optionId == 4) return sendingHIFI(handlerInput);


    return handlerInput.responseBuilder.speak("Sorry i am not sure about that").getResponse();
  }
};



module.exports = ChooseOptionIntentHandler;