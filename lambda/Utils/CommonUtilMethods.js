var cardContent = "";
var cardHeader = "beGalileo";
const { getChallengeQuiz, submitQuizChallenge } = require("./HttpUtils");
const { getUserInfo } = require("./HttpUtils");
const { isNotificationAvailable } = require("./NotificationUtilMethods")
const Constants = require("../Constants");
const states = Constants.states;


async function openMainMenu(handlerInput) {

  const accessToken =
    handlerInput.requestEnvelope.context.System.user.accessToken;
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  console.log("Access Token " + accessToken);
  if (accessToken == undefined) {
    return showLinkRequired(handlerInput);
  }
  else {

    const dataResponse = await getUserInfo(accessToken);

    if (!dataResponse.status) {
      return handlerInput.responseBuilder
        .speak(Constants.email_not_registered)
        .getResponse();
    }
    if (dataResponse.student_data.length < 1) {
      var speechText =
        Constants.no_student_registered +  " this account";
      sessionAttributes.repeat_message = speechText;
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard("beGalileo", speechText)
        .getResponse();
    }

    const studentdata = dataResponse.student_data[0];
    var studentName =
      studentdata.first_name + " " + studentdata.last_name;

    sessionAttributes.student_id = studentdata.student_id;
    sessionAttributes.parent_id = dataResponse.parent_data[0].id;
    sessionAttributes.IS_STUDENT = true;

    return showMainMenu(handlerInput);

    var studentName =
      dataResponse.student_data[0].first_name +
      " " +
      dataResponse.student_data[0].last_name;

    var speechText =
      "Hello! welcome to be galileo <break time='200ms'/>  Are you " +
      studentName +
      "?";
    var cardText = "Hello! welcome to beGalileo Are you " + studentName;
    sessionAttributes.state = states.IS_STUDENT;
    sessionAttributes.studentName = studentName;
    sessionAttributes.dataResponse = dataResponse;
    sessionAttributes.parent_id = dataResponse.parent_data[0].id;
    sessionAttributes.repeat_message = speechText;
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("beGalileo", cardText)
      .withShouldEndSession(false)
      .getResponse();
  }
}

function showLinkRequired(handlerInput) {
  const uiData = require("../screens/data/LinkAccountData.json");
  const uiTemplate = require("../screens/template/LinkAcountTemplate.json");
  const speakOutput = "Please use the Alexa app or web to link your be galileo account";
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.repeat_message = speakOutput;


  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);

  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(uiEntityDirective)
      .withShouldEndSession(true)
      .withLinkAccountCard()
      .getResponse();
  } else {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .withLinkAccountCard()
      .getResponse();
  }

}


function confirmRecentTopics(handlerInput) {
  var resolutionsPerAuth =
    handlerInput.requestEnvelope.request.intent.slots.lessonOption.resolutions
      .resolutionsPerAuthority;
  var lessonId = resolutionsPerAuth[1].values[0].value.id;
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.sub_concept_id = lessonId;
  sessionAttributes.state = Constants.states.REVISE;

  var lessonName = resolutionsPerAuth[1].values[0].value.name;
  console.log(resolutionsPerAuth[1].values[0].value.name);
  var speechOutput =
    "You Choose " +
    lessonName +
    ". Do you want to play a quiz or play a video or revise a topic ";

  sessionAttributes.help_message =
    "you can say <break time='200ms'/>play a quiz <break time='100ms'/>or <break time='100ms'/> play a video <break time='100ms'/> or <break time='100ms'/> revise a topic";
  sessionAttributes.repeat_message = speechOutput;
  return handlerInput.responseBuilder
    .speak(speechOutput)
    .withShouldEndSession(false)
    .getResponse();
}

function getConceptSynonym(i) {
  var array = [];
  switch (i) {
    case 0:
      array.push("number one");
      array.push("one");
      break;
    case 1:
      array.push("number two");
      array.push("two");
      break;
    case 2:
      array.push("number three");
      array.push("three");
      break;
    case 3:
      array.push("number four");
      array.push("four");
      break;
    case 4:
      array.push("number five");
      array.push("five");
      break;
    case 5:
      array.push("number six");
      array.push("six");
      break;
    case 6:
      array.push("number seven");
      array.push("seven");
      break;
    case 7:
      array.push("number eight");
      array.push("eight");
      break;
    case 8:
      array.push("number nine");
      array.push("nine");
      break;
    case 9:
      array.push("number ten");
      array.push("ten");
      break;
    case 10:
      array.push("number eleven");
      array.push("eleven");
      break;
    case 11:
      array.push("number twelve");
      array.push("twelve");
      break;
  }
  console.log("Concept synonym", array);
  return array;
}

function showMainMenu(handlerInput) {
  const uiData = require("../screens/data/MenuListData.json");
  const uiTemplate = require("../screens/template/MenuListTemplate.json");

  var menuOptions = ["Practice", "Leader Boards", "Rewards", "Badges"];

  uiData.bodyTemplate1Data.textContent.primaryText.text = "Main menu";

  var speakOutput = "";

  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  if (!sessionAttributes.isResumeLaunch)
    speakOutput = "Welcome to beGalileo"
  speakOutput += '<break time="0.5s"/> please select any of the following option';
  uiData.bodyTemplate1Data.menuListData.listPage.listItems = [];

  uiData.bodyTemplate1Data.backgroundImage.sources[0].url =
    "https://www.begalileo.com/assets/blc/begalileo-math-learning-center-homepage-banner.png";
  uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
    "https://www.begalileo.com/assets/blc/begalileo-math-learning-center-homepage-banner.png";

  uiData.bodyTemplate1Data.logoUrl =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/beGalileo_logo.png";

  menuOptions.forEach(function (value, i) {
    console.log(value);
    speakOutput += '<break time="0.5s"/> ' + value;
    var dataItem = {
      listItemIdentifier: i,
      ordinalNumber: i,
      textContent: {
        primaryText: {
          type: "PlainText",
          text: value
        }
      },
      token: value
    };
    uiData.bodyTemplate1Data.menuListData.listPage.listItems.push(dataItem);
  });

  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);


  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(uiEntityDirective)
      .withShouldEndSession(false)
      .getResponse();
  }
  else {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
  }


}

function getUIEntityDirective(uiTemplate, uiData) {
  // uiTemplate.layouts.ListItemTemplate.items[0].items = [];
  let uiEntityDirective = {
    type: "Alexa.Presentation.APL.RenderDocument",
    version: "1.0",
    token: "documentToken",
    document: uiTemplate,
    datasources: uiData
  };
  return uiEntityDirective;
}

function getAudioEntityDirective(lengthValue) {
  let audioEntityDirective = {
    type: "Alexa.Presentation.APL.ExecuteCommands",
    token: "documentToken",
    commands: [
      {
        type: "SpeakList",
        componentId: "mySequence",
        start: 0,
        count: lengthValue,
        highlightMode: "block",
        minimumDwellTime: 700,
        align: "center"
      }
    ]
  };
  return audioEntityDirective;
}

function addTemplateTransformers(uiData, uiTemplate, index, textName) {
  var subjectSsml = "subjectSsml" + index;
  var subjectSpeech = "subjectSpeech" + index;
  var subject = "subject" + index;
  var transformersSpeech = {
    inputPath: subjectSsml,
    outputName: subjectSpeech,
    transformer: "ssmlToSpeech"
  };
  var transformersText = {
    inputPath: subjectSsml,
    outputName: subject,
    transformer: "ssmlToText"
  };

  var viewTemplateItem = {
    type: "Text",
    id: "subjectNameText" + index,
    text: "${payload.catFactData.properties." + subject + "}",
    speech: "${payload.catFactData.properties." + subjectSpeech + "}",
    style: "myStyle",
    paddingTop: 20,
    paddingBottom: 20
  };
  uiData.catFactData.properties["subjectSsml" + index] =
    "<speak>" + textName + "</speak>";

  uiData.catFactData.transformers.push(transformersText);
  uiData.catFactData.transformers.push(transformersSpeech);

  uiTemplate.layouts.ListItemTemplate.items[0].items.push(viewTemplateItem);
}


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

function sendNotification(message) {
  var serverKey = "AIzaSyCI1MWRHkD38bsweCZBvl-HIen0jNF4UOI"; //put your server key here
  var fcm = new FCM(serverKey);
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

async function studentQuizChallenge(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  var notification =
    sessionAttributes.dataResponse.student_data[0].concept_practiced[0].unseen_notifications[0];

  var dataResponse = await getChallengeQuiz(notification.id);
  var questionData = dataResponse.question_data[0];
  var speakText =
    "Here is the question <break time='200ms'/>" +
    questionData.question_text;;
  speakText +=
    '<break time="200ms"/> Option  <say-as interpret-as="spell-out">A</say-as>' +
    questionData.choices[0].choices;
  speakText +=
    '<break time="200ms"/> Option  <say-as interpret-as="spell-out">B</say-as>' +
    questionData.choices[1].choices;
  sessionAttributes.dataResponse = dataResponse;
  cardContent += "Question : " + questionData.question_text + " \r\n";
  cardContent += "Option A : " + questionData.choices[0].choices + "\r\n";
  cardContent += "Option B : " + questionData.choices[1].choices;
  sessionAttributes.repeat_message = speakText;
  sessionAttributes.help_message = Constants.option_help_message;
  return handlerInput.responseBuilder
    .withShouldEndSession(false)
    .withSimpleCard(cardHeader, cardContent)
    .speak(speakText)
    .getResponse();
}


function studentQuizChallengeValuate(handlerInput, userAnswer) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  var dataResponse = sessionAttributes.dataResponse;
  var choices = dataResponse.question_data[0].choices;
  var notificationId = dataResponse.question_data[0].alexa_user_notification_id;
  var questionId = dataResponse.question_data[0].question_id;
  var studentChoiceId = 0;
  var speakText = "";
  var correctAnswer = "";
  if (choices[0].choices) {
    correctAnswer = "a";
  }
  else {
    correctAnswer = "b";
  }
  if (correctAnswer === userAnswer) {
    speakText +=
      'Well done <break time="200ms"/> Option <say-as interpret-as="spell-out">' + userAnswer + '</say-as>  is correct';
  }
  else {
    speakText +=
      'Well done <break time="200ms"/> Option <say-as interpret-as="spell-out">' +
      userAnswer +
      "</say-as>  is Incorrect";
  }

  if (userAnswer === "a") {
    studentChoiceId = choices[0].id;
  }
  else {
    studentChoiceId = choices[1].id;
  }

  speakText += '<break time="200ms"/> Thank you <break time="200ms"/>' + Constants.conclude_message;
  sessionAttributes.state = states.CONCLUDE;
  submitQuizChallenge(notificationId, questionId, studentChoiceId);
  sessionAttributes.repeat_message = speakText;
  sessionAttributes.help_message = Constants.yes_or_no_help_message;
  return handlerInput.responseBuilder
    .withShouldEndSession(false)
    .speak(speakText)
    .getResponse();
}




function singleDigitRandomNumber() {
  return Math.floor(Math.random() * 10);
}

function twoDigitRandomNumber() {
  return Math.floor(Math.random() * 90 + 10);
}

function quizResultVoiceExpression(isCorrect, msg) {
  var expression = "";
  if (isCorrect) {
    expression = '<prosody rate="70%" pitch="+40%" volume="x-loud">' + msg + '</prosody>';
  }
  else {
    expression =
      '<prosody rate="70%" pitch="+40%" volume="x-loud">' +
      msg +
      "</prosody>";
  }
  return expression;
}


function getHelpMessage(handlerInput) {
  var speakOutput = "";
  var sayingsData = availableSayings(handlerInput);
  speakOutput += sayingsData[0];
  return speakOutput;
}

function stripTags(message) {
  var regex = /(<([^>]+)>)/gi;
  return message.replace(regex, "");
}

async function toMainMenu(handlerInput) {

  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.isResumeLaunch = true;

  return openMainMenu(handlerInput);

  var speakOutput = "";

  const accessToken =
    handlerInput.requestEnvelope.context.System.user.accessToken;
  const dataResponse = await getUserInfo(accessToken);
  sessionAttributes.dataResponse = dataResponse;
  console.log(sessionAttributes.dataResponse);
  //var notificationCount = 3;
  var sayingsData = availableSayings(handlerInput);
  speakOutput = sayingsData[0];
  cardContent = sayingsData[1];
  sessionAttributes.help_message = speakOutput;
  sessionAttributes.repeat_message = speakOutput;
  return handlerInput.responseBuilder
    .withShouldEndSession(false)
    .withSimpleCard(cardHeader, cardContent)
    .speak(speakOutput)
    .getResponse();
}


function availableSayings(handlerInput) {
  var sayingsData = new Array();
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var notificationCount = isNotificationAvailable(handlerInput);
  if (!sessionAttributes.IS_STUDENT) {
    if (notificationCount > 0) {
      speakOutput =
        "you can ask <break time='200ms'/> What is my kid status? <break time='200ms'/> or <break time='200ms'/> read my notification";
      cardContent =
        "you can ask \r\n my kid status \r\n  read my notifications";
    } else {
      speakOutput = "you can ask <break time='200ms'/> What is my kid status";
      cardContent = "you can ask \r\n my kid status";
    }

  } else {
    if (notificationCount > 0) {
      speakOutput =
        "you can ask <break time='200ms'/> can i revise my class <break time='200ms'/> or <break time='200ms'/> read my notifications";
      cardContent =
        "you can ask \r\n can i revise my class \r\n  read my notifications";
    } else {
      speakOutput =
        "you can ask <break time='200ms'/> can i revise my class or play game";
      cardContent = "you can ask \r\n can i revise my class or play game";
    }
  }

  sayingsData[0] = speakOutput;
  sayingsData[1] = cardContent;
  return sayingsData;

}

function supportsDisplay(handlerInput) {
  return (
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    (handlerInput.requestEnvelope.context.System.device.supportedInterfaces[
      "Alexa.Presentation.APL"
    ] ||
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces
        .Display) &&
    handlerInput.requestEnvelope.context.Viewport
  );
}
function checkSupportedDisplay(handlerInput) {

  if (typeof supportsDisplay(handlerInput) == Constants.UNDEFINED) {
    return false;
  }
  else {
    if (supportsDisplay(handlerInput).shape == "RECTANGLE") {
      return true;
    }
    else {
      return false;
    }
  }

}

module.exports = {
  stripTags,
  getHelpMessage,
  getEmail,
  sendNotification,
  quizResultVoiceExpression,
  studentQuizChallenge,
  studentQuizChallengeValuate,
  toMainMenu,
  openMainMenu,
  singleDigitRandomNumber,
  twoDigitRandomNumber,
  getUIEntityDirective,
  addTemplateTransformers,
  getAudioEntityDirective,
  confirmRecentTopics,
  getConceptSynonym,
  checkSupportedDisplay
};