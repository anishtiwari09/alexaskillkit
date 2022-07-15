const https = require("https");
const config = require("../config");
var cardContent = "";
var cardHeader = "beGalileo";
const { getChallengeQuiz, submitQuizChallenge } = require("./HttpUtils");
var FCM = require("fcm-node");


async function getEmail(handlerInput) {
  const {
    requestEnvelope,
    serviceClientFactory,
    responseBuilder
  } = handlerInput;
  const token =
    requestEnvelope.context.System.user.permissions &&
    requestEnvelope.context.System.user.permissions.consentToken;

  if (!token) {
    return responseBuilder
      .speak("Please Provide Permissions!")
      .withAskForPermissionsConsentCard(["alexa::profile:email:read"])
      .getResponse();
  }

  let { deviceId } = requestEnvelope.context.System.device;
  const upsServiceClient = serviceClientFactory.getUpsServiceClient();
   const email = await upsServiceClient.getProfileEmail();
   return email;
}

function sendNotification(message)
{
      var serverKey = "AIzaSyCI1MWRHkD38bsweCZBvl-HIen0jNF4UOI"; //put your server key here
      var fcm = new FCM(serverKey);
      fcm.send(message, function(err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
}

async function studentQuizChallenge(handlerInput)
{
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  
      var notification =
      sessionAttributes.dataResponse.student_data[0].concept_practiced[0].unseen_notifications[0];

      var dataResponse = await getChallengeQuiz(notification.id);  
      var questionData = dataResponse.question_data[0];
      var speakText =
        "Here is the question <break time='200ms'/>" +
        questionData.question_text; ;
        speakText +=
          '<break time="200ms"/> Option  <say-as interpret-as="spell-out">A</say-as>' +
                questionData.choices[0].choices;
        speakText +=
          '<break time="200ms"/> Option  <say-as interpret-as="spell-out">B</say-as>' +
                 questionData.choices[1].choices;
      sessionAttributes.dataResponse = dataResponse;
      cardContent += "Question : "+questionData.question_text+" \r\n";
      cardContent += "Option A : " + questionData.choices[0].choices+"\r\n";
      cardContent += "Option B : " + questionData.choices[1].choices;
  
      return handlerInput.responseBuilder
        .withShouldEndSession(false)
        .withSimpleCard(cardHeader,cardContent)
        .speak(speakText)
        .getResponse();
}
function studentQuizChallengeValuate(handlerInput,userAnswer)
{
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    var dataResponse = sessionAttributes.dataResponse;
    var choices = dataResponse.question_data[0].choices;
    var notificationId = dataResponse.question_data[0].alexa_user_notification_id;
    var questionId = dataResponse.question_data[0].question_id;
    var studentChoiceId = 0;
    var speakText = "";
    var correctAnswer="";
    if(choices[0].choices)
    {
      correctAnswer = "a";
      
    }
    else
    {
      correctAnswer = "b";
    }
    if(correctAnswer===userAnswer)
    {
        speakText +=
          'Well done <break time="200ms"/> Option <say-as interpret-as="spell-out">' + userAnswer +'</say-as>  is correct';
    }
    else
    {
         speakText +=
           'Well done <break time="200ms"/> Option <say-as interpret-as="spell-out">' +
           userAnswer +
           "</say-as>  is Incorrect";
    }

    if(userAnswer==="a")
    {
        studentChoiceId = choices[0].id;
    }
    else
    {
        studentChoiceId = choices[1].id;
    }

    speakText += '<break time="200ms"/> Thank you';
    submitQuizChallenge(notificationId, questionId,studentChoiceId);
    return handlerInput.responseBuilder
      .speak(speakText)
      .getResponse();
}


function quizResultVoiceExpression(isCorrect,msg)
{
      var expression = "";
      if(isCorrect)
      {
        expression = '<prosody rate="50%" pitch="+40%" volume="x-loud">'+msg+'</prosody>';
      }
      else
      {
          expression =
            '<prosody rate="50%" pitch="+40%" volume="x-loud">' +
            msg +
            "</prosody>";
      }
      return expression;
}
function stripTags(message) {
  var regex = /(<([^>]+)>)/gi;
  return message.replace(regex, "");
};

function toMainMenu(handlerInput)
{
  var speakOutput = "";
   const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if(sessionAttributes.IS_STUDENT)
    {
        speakOutput =
          "you can ask <break time='200ms'/> can i revise my class <break time='200ms'/> or <break time='200ms'/> read my notifications";
        cardContent =
          "you can ask \r\n can i revise my class \r\n  read my notifications";
    }
    else
    {
        speakOutput =
          "you can ask <break time='200ms'/> What is my kid status? <break time='200ms'/> or <break time='200ms'/> read my notification";
        cardContent =
          "you can ask \r\n my kid status \r\n  read my notifications";
    }
    return handlerInput.responseBuilder
      .withShouldEndSession(false)
      .withSimpleCard(cardHeader, cardContent)
      .speak(speakOutput)
      .getResponse();
}
function getHelpMessage(handlerInput) {
  var speakOutput = "";
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  if (sessionAttributes.IS_STUDENT) {
    speakOutput =
      "you can ask <break time='200ms'/> can i revise my class <break time='200ms'/> or <break time='200ms'/> read my notifications";
    cardContent =
      "you can ask \r\n can i revise my class \r\n  read my notifications";
  } else {
    speakOutput =
      "you can ask <break time='200ms'/> What is my kid status? <break time='200ms'/> or <break time='200ms'/> read my notification";
    cardContent = "you can ask \r\n my kid status \r\n  read my notifications";
  }
  return speakOutput;
}

module.exports = {
  getEmail,
  sendNotification,
  quizResultVoiceExpression,
  studentQuizChallenge,
  studentQuizChallengeValuate,
  stripTags,
  toMainMenu,
  getHelpMessage
};