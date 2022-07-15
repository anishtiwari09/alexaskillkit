const { searchConcept } = require("../Utils/ChooseConceptMethods");
const { showLeaderBoard,showRewards,showBadges } = require("../handlers/ChooseOptionMethods");
const { toMainMenu,checkSupportedDisplay } = require("../Utils/CommonUtilMethods");
const Constants = require("../Constants");
const OtherFeatureIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "OtherFeatureIntent"
    );
  },
  handle(handlerInput) {
    var speechText = "Other Options";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    //Reset Concept List index
  
    console.log("DDDDDDDDDDDDDDDDD")    
    console.log(handlerInput.requestEnvelope.request.intent);
    var resolutionsPerAuth =
      handlerInput.requestEnvelope.request.intent.slots["choice"].resolutions
        .resolutionsPerAuthority;
   
    var optionId = resolutionsPerAuth[0].values[0].value.id;
    var optionName = resolutionsPerAuth[0].values[0].value.name;

    if(optionId==0){
      sessionAttributes.page = 0;
        return showRewards(handlerInput);
    }

    if(optionId==3)
    {
        return searchConcept(handlerInput);
    }
    if(optionId == 4)
    {
      sessionAttributes.page = 0;
      speechText = "Do you want to practice a quiz or";
      speechText += '<break time="0.3s"/> watch a video lesson';
        speechText += '<break time="0.3s"/> You can say practice a quiz  or <break time="0.2s"/>  watch a video lesson';

      if (!checkSupportedDisplay(handlerInput)) {
        speechText = Constants.quiz_video_not_supported_message;
      }

        return handlerInput.responseBuilder
          .speak(speechText)
          .withShouldEndSession(false)
          .getResponse();
    }
    if(optionId == 2){
      sessionAttributes.page = 0;
        return showLeaderBoard(handlerInput);
    }
    if(optionId == 1)
    {
      sessionAttributes.page = 0;
      return showBadges(handlerInput);
    }
  
    if(optionId == 5)
        return toMainMenu(handlerInput);

    speechText += optionName;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  }
};
module.exports = {
    OtherFeatureIntentHandler
}
