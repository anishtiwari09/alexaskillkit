const Constants = require("../Constants");
const { getUserInfo } = require("../Utils/HttpUtils");
const { getConceptSynonym,getUIEntityDirective } = require("../Utils/CommonUtilMethods")

const ReviseClassIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "ReviseClassIntent"
    );
  },
async handle(handlerInput) {
  const uiData = require("../screens/data/MenuListData.json");
  const uiTemplate = require("../screens/template/MenuListTemplate.json");
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const accessToken =
      handlerInput.requestEnvelope.context.System.user.accessToken;
    const dataResponse = await getUserInfo(accessToken);
    let speakText = "";
    let cardText = "";

    sessionAttributes.state = Constants.states.START;

    uiData.bodyTemplate1Data.menuListData.listPage.listItems = [];

    uiData.bodyTemplate1Data.textContent.primaryText.text="Recent Topics";

    uiData.bodyTemplate1Data.backgroundImage.sources[0].url =
      "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";
    uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
      "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";

    uiData.bodyTemplate1Data.logoUrl =
      "https://wisdomleap-hls-playback.s3.amazonaws.com/images/beGalileo_logo.png";
    
    if(!dataResponse.status)
         return handlerInput.responseBuilder
           .speak(Constants.email_not_registered)
           .getResponse();
         
    if(dataResponse.student_data.length < 1)
          return handlerInput.responseBuilder
            .speak(Constants.no_student_registered)
            .getResponse(); 
    if (dataResponse.student_data[0].concept_practiced.length < 1)
      return handlerInput.responseBuilder
        .speak(Constants.no_concept_found)
        .getResponse();
    else 
    {
         sessionAttributes.student_id = dataResponse.student_data[0].student_id;
         var conceptPracticed = dataResponse.student_data[0].concept_practiced;
         speakText = getConcepts(conceptPracticed);
         
        let checkEntityDirective = {
          type: "Dialog.UpdateDynamicEntities",
          updateBehavior: "REPLACE",
          types: [
            {
              name: "LessonOption",
              values: [
                
              ]
            }
          ]
        };
        for (i = 0; i < conceptPracticed.length; i++) {
          cardText += i + 1 + " : " + conceptPracticed[i].name + "\r\n";
          var rrr = {
            id: conceptPracticed[i].id,
            name: {
              value: conceptPracticed[i].name,
              synonyms: getConceptSynonym(i)
            }
          };
          var dataItem = {
            listItemIdentifier: conceptPracticed[i].id,
            ordinalNumber: conceptPracticed[i].id,
            textContent: {
              primaryText: {
                type: "PlainText",
                text: i + 1 + " : " + conceptPracticed[i].name
              }
            },
            token: conceptPracticed[i].name
          };
          uiData.bodyTemplate1Data.menuListData.listPage.listItems.push(
            dataItem
          );
          checkEntityDirective.types[0].values.push(rrr);   
        }

        let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);
         
            
        console.log(checkEntityDirective.types[0].values);
        sessionAttributes.help_message = Constants.topic_name_help_message;
          sessionAttributes.repeat_message = speakText;
        return handlerInput.responseBuilder
          .speak(speakText)
          .reprompt(Constants.topic_name_help_message)
          .addDirective(checkEntityDirective)
          .addDirective(uiEntityDirective)
          .withShouldEndSession(false)
          .getResponse();
    }
   
  }
};




function getConcepts(conceptPracticed)
{
    let speech =
      '<prosody rate="30%" pitch="+40%" volume="x-loud">Sure! </prosody>These are the recent topics <break time="0.3s" />';
    for (i = 0; i < conceptPracticed.length; i++) {
      speech +=  conceptPracticed[i].name + ', <break time="0.3s" />';
     
    }
    speech += '. Which one you need to revise?';
    return speech;
}



module.exports = ReviseClassIntentHandler;
