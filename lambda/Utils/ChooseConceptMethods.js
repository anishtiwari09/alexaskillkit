const { getConceptByName } = require("./HttpUtils");
const {
  getUIEntityDirective,
  getConceptSynonym,
  checkSupportedDisplay
} = require("./CommonUtilMethods");
const QuizStartIntentHandler = require("../handlers/QuizStartIntentHandler");
const { playVideo, highlights } = require("../handlers/ChooseOptionMethods");
const Constants = require("../Constants");

async function searchConcept(handlerInput) {
  if (!checkSupportedDisplay(handlerInput)) {
    speechText = Constants.quiz_video_not_supported_message;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  }

  const uiData = require("../screens/data/MenuListData.json");
  const uiTemplate = require("../screens/template/MenuListTemplate.json");


  var speechText = "";
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  if (
    typeof sessionAttributes.page == "undefined" ||
    sessionAttributes.page == 0
  ) {
    sessionAttributes.page = 0;

    var searchTerm = "";

    if (
      typeof handlerInput.requestEnvelope.request.intent.slots != "undefined" &&
      typeof handlerInput.requestEnvelope.request.intent.slots.raw_input !=
      "undefined"
    ) {
      searchTerm =
        handlerInput.requestEnvelope.request.intent.slots.raw_input.value;
    }
    if (typeof searchTerm == "undefined")
      searchTerm = "";

    sessionAttributes.searchTerm = searchTerm;
    console.log("Session ", sessionAttributes);
    if (searchTerm == "") {
      if (sessionAttributes.state == Constants.states.QUIZ) {
        speechText = 'these are the recent quiz topics <break time="0.2s" />  ';
        if (sessionAttributes.page > 1)
          uiData.bodyTemplate1Data.textContent.primaryText.text = "More quiz topic";
        else
          uiData.bodyTemplate1Data.textContent.primaryText.text = "Recent Quiz Topic";
      }
      else if (sessionAttributes.state == Constants.states.VIDEO) {
        speechText = 'these are the recent video topic you were practicing <break time="0.2s" />  which one you need to watch <break time="0.2s" /> ';
        if (sessionAttributes.page > 1)
          uiData.bodyTemplate1Data.textContent.primaryText.text = "More video topic";
        else
          uiData.bodyTemplate1Data.textContent.primaryText.text = "Recent Video Topic";
      }


    }
    else {
      speechText = "Please choose any of the following";
      uiData.bodyTemplate1Data.textContent.primaryText.text = "Please choose any of the following";
    }

  } else {
    speechText = "Here is more";
    if (sessionAttributes.state == Constants.states.QUIZ)
      uiData.bodyTemplate1Data.textContent.primaryText.text = "More Quiz Topic";
    else
      uiData.bodyTemplate1Data.textContent.primaryText.text = "More Video Topic";
  }
  sessionAttributes.page++;

  console.log("ConceptSearch : " + sessionAttributes.searchTerm);
  const dataResponse = await getConceptByName(
    sessionAttributes.searchTerm,
    sessionAttributes.page,
    sessionAttributes.state,
    sessionAttributes.student_id
  );
  console.log("Concept Data Response", dataResponse.response);
  sessionAttributes.concepts = dataResponse.response;
  if (!dataResponse.status) {
    speechText = "No topic found.";
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  }
  // if (dataResponse.response.length == 1 && sessionAttributes.page == 1) {
  //   sessionAttributes.sub_concept_id = dataResponse.response[0].id;
  //   if (sessionAttributes.state == Constants.states.QUIZ) {
  //     return QuizStartIntentHandler.handle(handlerInput);
  //   } else if (sessionAttributes.state == Constants.states.REVISE) {
  //     return highlights(handlerInput);
  //   } else {
  //     return playVideo(handlerInput);
  //   }
  // }

  // return handlerInput.responseBuilder
  // .withShouldEndSession(false)
  // .speak("Concept Name")
  // .getResponse();

  uiData.bodyTemplate1Data.menuListData.listPage.listItems = [];

  let checkEntityDirective = {
    type: "Dialog.UpdateDynamicEntities",
    updateBehavior: "REPLACE",
    types: [
      {
        name: "LessonOption",
        values: []
      }
    ]
  };

  dataResponse.response.forEach(function (value, i) {
    console.log(value);
    speechText += '<break time="0.5s"/> ' + value.name;
    var dataItem = {
      listItemIdentifier: i,
      ordinalNumber: i,
      textContent: {
        primaryText: {
          type: "PlainText",
          text: i + 1 + ". " + value.name
        }
      },
      token: value.name
    };
    uiData.bodyTemplate1Data.menuListData.listPage.listItems.push(dataItem);

    var rrr = {
      id: value.id,
      pos: i,
      name: {
        value: value.name.replace("-", ""),
        synonyms: getConceptSynonym(i)
      }
    };

    checkEntityDirective.types[0].values.push(rrr);
  });

  console.log(uiData.bodyTemplate1Data.menuListData.listPage.listItems);

  uiData.bodyTemplate1Data.backgroundImage.sources[0].url =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";

  uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";



  if (sessionAttributes.state == Constants.states.QUIZ) {
    speechText += '<break time="0.5s"/> to practice ';
  }
  else if (sessionAttributes.state == Constants.states.VIDEO) {
    speechText += '<break time="0.5s"/> to watch ';
  }
  console.log("Size of data ", dataResponse.response.length)

  if (dataResponse.response.length == 1)
    speechText += ' just say topic number like number one';
  else if (dataResponse.response.length > 1)
    speechText += ' just say topic number like number one or number two';



  sessionAttributes.dataResponse = dataResponse;
  if (dataResponse.next_page) {
    speechText += '<break time="0.5s"/> or say more for more options';
  }
  else {

    if (sessionAttributes.state == Constants.states.QUIZ && sessionAttributes.page > 1)
      speechText += '<break time="0.5s"/>or say recent quiz topics';
    else if (sessionAttributes.state == Constants.states.VIDEO && sessionAttributes.page > 1)
      speechText += '<break time="0.5s"/>or say recent video topics';

    sessionAttributes.page = 0
  }

  sessionAttributes.help_message = Constants.topic_name_help_message_first;
  sessionAttributes.repeat_message = speechText;

  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);

  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(speechText)
      .addDirective(uiEntityDirective)
      .addDirective(checkEntityDirective)
      .withShouldEndSession(false)
      .getResponse();
  } else {
    return handlerInput.responseBuilder
      .speak(speechText)
      .addDirective(checkEntityDirective)
      .withShouldEndSession(false)
      .getResponse();
  }
}
module.exports = {
  searchConcept
};
