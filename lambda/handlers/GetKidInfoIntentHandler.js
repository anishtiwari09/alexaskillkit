const https = require("https");
const config = require("../config");
const Constants = require("../Constants");
const { getUserInfo } = require("../Utils/HttpUtils");
const { getUIEntityDirective } = require("../Utils/CommonUtilMethods");
const GetKidInfoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "GetKidInfoIntent"
    );
  },
  async handle(handlerInput) {
    const uiData = require("../screens/data/MenuListData.json");
    const uiTemplate = require("../screens/template/MenuListTemplate.json");

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    uiData.bodyTemplate1Data.menuListData.listPage.listItems = [];

    uiData.bodyTemplate1Data.textContent.primaryText.text = "Your Kid Status : ";

    uiData.bodyTemplate1Data.backgroundImage.sources[0].url =
      "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";
    uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
      "https://wisdomleap-hls-playback.s3.amazonaws.com/images/04.jpg";

    uiData.bodyTemplate1Data.logoUrl =
      "https://wisdomleap-hls-playback.s3.amazonaws.com/images/beGalileo_logo.png";

    const accessToken =
      handlerInput.requestEnvelope.context.System.user.accessToken;
      //const response = await httpGet(); 
    const response = await getUserInfo(accessToken); 
    console.log(response);
    let speechText = "";
    let cardText = "";


    if(!response.status){
      speechText = Constants.email_not_registered;
       return handlerInput.responseBuilder
         .speak(speechText)
         .withShouldEndSession(false)
         .reprompt(Constants.what_would_you_like)
         .getResponse();
    }

    var messageArray = [];
    if (response.status) {

      const studentdata = response.student_data[0];
      var studentName = studentdata.first_name +" "+ studentdata.last_name ;
      
      sessionAttributes.student_id = studentdata.student_id;
      sessionAttributes.sub_concept_id = studentdata.concept_practiced[0].id;
      sessionAttributes.studentName = studentName;
      speechText =
        studentName +
        " completed " +
        studentdata.concept_practiced[0].name +
        ". Scored " +
        studentdata.concept_practiced[0].score +
        " Out of " +
        studentdata.concept_practiced[0].total +
        '<break time="0.5s" />' +
        Constants.do_you_want_to_challenge +
        studentName +
        Constants.with_a_question_send_hifi;
      
        
      
        cardText =
          studentdata.first_name +
          " " +
          studentdata.last_name +
          " completed " +
          studentdata.concept_practiced[0].name +
          ". Scored " +
          studentdata.concept_practiced[0].score +
          " Out of " +
          studentdata.concept_practiced[0].total +
          "\r\n" +
          Constants.do_you_want_to_challenge +
          studentName +
          Constants.with_a_question_send_hifi;

          messageArray.push(
            studentdata.first_name +
              " " +
              studentdata.last_name +
              " completed " +
              studentdata.concept_practiced[0].name
          );
          messageArray.push(
            " Scored " +
              studentdata.concept_practiced[0].score +
              " Out of " +
              studentdata.concept_practiced[0].total
          );
         
           messageArray.push(
             Constants.do_you_want_to_challenge +
               studentName +
               Constants.with_a_question_send_hifi
           );
           messageArray.forEach(function(value,i) {
             
            var dataItem = {
              listItemIdentifier: "ident"+i,
              ordinalNumber: i,
              textContent: {
                primaryText: {
                  type: "PlainText",
                  text:  value
                }
              },
              token: "token"+i
            };
            uiData.bodyTemplate1Data.menuListData.listPage.listItems.push(
              dataItem
            );
           });
    } 

       let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);
    sessionAttributes.help_message =
      "you can say <break time='200ms'/> challenge a quiz <break time='100ms'/> or <break time='100ms'/> send a HI-FIVE";
    sessionAttributes.repeat_message = speechText; 
    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(false)
      .addDirective(uiEntityDirective)
      .reprompt(Constants.what_would_you_like)
      .getResponse();
  }
};


module.exports = GetKidInfoIntentHandler;