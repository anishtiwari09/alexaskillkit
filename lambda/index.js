
// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const YesIntentHandler = require("./handlers/YesIntentHandler");
const NoIntentHandler = require("./handlers/NoIntentHandler");
const QuizStartIntentHandler = require("./handlers/QuizStartIntentHandler");
const QuizAnswerIntentHandler = require("./handlers/QuizAnswerIntentHandler");
const GetKidInfoIntentHandler = require("./handlers/GetKidInfoIntentHandler");
const ReviseClassIntentHandler = require("./handlers/ReviseClassIntentHandler");
const ChooseOptionIntentHandler = require("./handlers/ChooseOptionIntentHandler");
const ReadNotificationIntentHandler = require("./handlers/ReadNotificationIntentHandler"); 
const { PlayGameIntentHandler, GameMenuIntentHandler, NumbersIntentHandler } = require("./handlers/PlayGameIntentHandler");
const {
  ConceptQuizSearchIntentHandler,
  ConceptVideoSearchIntentHandler,
  BedTimeSummaryIntentHandler
} = require("./handlers/ConceptSearchIntentHandler");
const { OtherFeatureIntentHandler } = require("./handlers/OtherFeatureIntenHandler");
const { confirmRecentTopics } = require("./Utils/CommonUtilMethods");
const {
  playVideo, highlights
} = require("./handlers/ChooseOptionMethods");

const { ChooseSubConcept } = require("./Utils/ChooseSubConceptMethod");

const Constants = require("./Constants");
const states = Constants.states;
const { openMainMenu, stripTags } = require("./Utils/CommonUtilMethods");
const { getUserInfo,logErrorMessage } = require("./Utils/HttpUtils");



const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {

    return openMainMenu(handlerInput);

  }
};

const ChooseClassIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ChooseClassIntent"
    );
  },
  handle(handlerInput) {
    if (
      !handlerInput.requestEnvelope.request.intent.slots.lessonOption.value
    ) {
      return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
    }
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var resolutionsPerAuth =
      handlerInput.requestEnvelope.request.intent.slots.lessonOption.resolutions
        .resolutionsPerAuthority;
    var lessonId = resolutionsPerAuth[1].values[0].value.id;
    var pos = resolutionsPerAuth[1].values[0].value.pos;
    console.log("Resolutions",resolutionsPerAuth[1]);
    sessionAttributes.sub_concept_id = lessonId;
    sessionAttributes.sub_concept_pos = pos;


    if (sessionAttributes.state == Constants.states.START)
      return confirmRecentTopics(handlerInput);
    else if (sessionAttributes.state == Constants.states.QUIZ)
      return QuizStartIntentHandler.handle(handlerInput);
    else if (sessionAttributes.state == Constants.states.REVISE)
      return highlights(handlerInput);
    else {
      console.log("Video Sub concept")
      console.log("Lesson Id ",lessonId);
      console.log(sessionAttributes.concepts);
      if(sessionAttributes.sub_concept_choose)
      {
       // sessionAttributes.sub_concept_choose = false;
        return playVideo(handlerInput);
      }
      else
        return ChooseSubConcept(handlerInput);

    }
  }
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (typeof sessionAttributes.help_message !== "undefined") {
      speakOutput += sessionAttributes.help_message;
    }
    else {
      return openMainMenu(handlerInput);
    }
    return handlerInput.responseBuilder
      .withShouldEndSession(false)
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
      "AMAZON.RepeatIntent"
    );
  },
  handle(handlerInput) {
    var speakOutput = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (typeof sessionAttributes.repeat_message !== "undefined") {
      speakOutput += sessionAttributes.repeat_message;
    } else {
      return openMainMenu(handlerInput);
    }
    return handlerInput.responseBuilder
      .withShouldEndSession(false)
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};



const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = Constants.exit_message;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  }
};


const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const speakOutput = `You just triggered ${intentName}`;
    var repeatMessage = sessionAttributes.repeat_message;
    var helpMessage = sessionAttributes.help_message;
    if (typeof helpMessage !== "undefined") {
      return handlerInput.responseBuilder
        .withShouldEndSession(false)
        .speak(helpMessage)
        .reprompt(helpMessage)
        .getResponse();
    }
    else if (typeof repeatMessage !== "undefined") {
      return handlerInput.responseBuilder
        .withShouldEndSession(false)
        .speak(repeatMessage)
        .reprompt(repeatMessage)
        .getResponse();
    } else {
      return openMainMenu(handlerInput);
    }

  }
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const accessToken =
          handlerInput.requestEnvelope.context.System.user.accessToken;
    let errorOutput = `I am not sure what you asked Please try again.`;
    logErrorMessage(accessToken,error.stack);
     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
 if (typeof sessionAttributes.help_message !== "undefined") {
      errorOutput += sessionAttributes.help_message;
    }
    else {
      return openMainMenu(handlerInput);
    }
    return handlerInput.responseBuilder
        .withShouldEndSession(false)
      .speak(errorOutput)
      .reprompt(errorOutput)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    QuizStartIntentHandler,
    QuizAnswerIntentHandler,
    GetKidInfoIntentHandler,
    HelpIntentHandler,
    YesIntentHandler,
    ChooseClassIntentHandler,
    ReviseClassIntentHandler,
    CancelAndStopIntentHandler,
    ChooseOptionIntentHandler,
    SessionEndedRequestHandler,
    NoIntentHandler,
    RepeatIntentHandler,
    ReadNotificationIntentHandler,
    PlayGameIntentHandler,
    GameMenuIntentHandler,
    NumbersIntentHandler,
    ConceptQuizSearchIntentHandler,
    ConceptVideoSearchIntentHandler,
    OtherFeatureIntentHandler,
    BedTimeSummaryIntentHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
