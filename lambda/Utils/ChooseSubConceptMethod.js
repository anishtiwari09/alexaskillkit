const { getConceptByName } = require("./HttpUtils");
const {
  getUIEntityDirective,
  getConceptSynonym,
  checkSupportedDisplay
} = require("./CommonUtilMethods");
const QuizStartIntentHandler = require("../handlers/QuizStartIntentHandler");
const { playVideo, highlights } = require("../handlers/ChooseOptionMethods");
const Constants = require("../Constants");

async function ChooseSubConcept(handlerInput) {
  if (!checkSupportedDisplay(handlerInput)) {
    speechText = Constants.quiz_video_not_supported_message;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .getResponse();
  }
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  const uiData = require("../screens/data/MenuListData.json");
  const uiTemplate = require("../screens/template/MenuListTemplate.json");
  uiData.bodyTemplate1Data.textContent.primaryText.text = "Choose any of the following";



  sessionAttributes.sub_concept_choose = true;

  var speechText = "";

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
  var dataResponse = sessionAttributes.concepts;
  console.log(dataResponse);

  

  speechText += '<break time="0.5s"/> You can say any of the topic number to choose ';
  dataResponse.forEach(function (conceptData, index) {
    if(conceptData.id == sessionAttributes.sub_concept_id)
    {
      conceptData.videos.forEach((listData,i)=>{
        speechText += '<break time="0.5s"/> ' + listData.name;
            var dataItem = {
              listItemIdentifier: i,
              ordinalNumber: i,
              textContent: {
                primaryText: {
                  type: "PlainText",
                  text: i + 1 + ". " + listData.name
                }
              },
              token: listData.name
            };
            uiData.bodyTemplate1Data.menuListData.listPage.listItems.push(dataItem);
    
            var rrr = {
              id: listData.id,
              name: {
                value: listData.name.replace("-", ""),
                synonyms: getConceptSynonym(i)
              }
            };
            checkEntityDirective.types[0].values.push(rrr);
      })
    }
  
      // value.videos.forEach((data,index)=>{
      //   if(data.id == sessionAttributes.sub_concept_id)
      //     console.log("Data ",data,index);
      // })
    // value.videos.every(function (data, i) {
    //   if (data.id == sessionAttributes.sub_concept_id) {
    //     console.log("Index Value", index);
    //     speechText += '<break time="0.5s"/> ' + value.name;
    //     var dataItem = {
    //       listItemIdentifier: i,
    //       ordinalNumber: i,
    //       textContent: {
    //         primaryText: {
    //           type: "PlainText",
    //           text: i + 1 + ". " + value.name
    //         }
    //       },
    //       token: value.name
    //     };
    //     uiData.bodyTemplate1Data.menuListData.listPage.listItems.push(dataItem);

    //     var rrr = {
    //       id: value.id,
    //       name: {
    //         value: value.name.replace("-", ""),
    //         synonyms: getConceptSynonym(i)
    //       }
    //     };
    //     checkEntityDirective.types[0].values.push(rrr);
    //     return false;
    //   }
    //   else
    //   return true;
    // })

  });

  console.log(uiData.bodyTemplate1Data.menuListData.listPage.listItems);

  uiData.bodyTemplate1Data.backgroundImage.sources[0].url =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";

  uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";

  sessionAttributes.dataResponse = dataResponse;
  
  if (dataResponse.next_page) {
    speechText += '<break time="0.5s"/> You can say more for more options';
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
  ChooseSubConcept
};
