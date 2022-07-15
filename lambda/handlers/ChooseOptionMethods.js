const { states, conclude_message } = require("../Constants");
const Constants = require("../Constants");
const { getActions, getLastTopic, getConceptVideo } = require("../Utils/HttpUtils");
const { createNotification, getRewardsDatas, getLeaderBoardDatas, getBadgeDatas } = require("../Utils/HttpUtils");
const { getUIEntityDirective,
  addTemplateTransformers,
  getAudioEntityDirective,
  checkSupportedDisplay
} = require("../Utils/CommonUtilMethods");



async function playVideo(handlerInput) {

  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  var subConceptId = sessionAttributes.sub_concept_id;
  var type = "video";
  const dataResponse = await getConceptVideo(studentId, subConceptId);
  console.log("Video Conept res", dataResponse);
  var speakOutput = "";

  sessionAttributes.page = 0;

  if (!dataResponse.status) {
    return handlerInput.responseBuilder.speak("No Video Found").getResponse();
  }

  var videoUrl = dataResponse.video;
  speakOutput += " awright! ";
  //speakOutput += "Playing video ";

  speakOutput +=
    "<audio src='soundbank://soundlibrary/musical/amzn_sfx_musical_drone_intro_01'/> ";



  // videoUrl =
  //   "https://ddyog7i9rylkl.cloudfront.net/karnataka/grade10/Maths/Graphs_and_Polyhedra/Polyhedra/CFF73B_X_KA_MAT17-master-playlist.m3u8?Expires=1580739217&Key-Pair-Id=APKAICORD66RPKDMHT4Q&Signature=VujzNg4PFZgv~rj8oNXGuFytR63bouP2Gh4RJ8HZw678Jz7ySyQRbkHJEgsbJCSyzR8~VMf8lNZRS3ByoCYUXMJtD0W3TbRGq~ziYQ3l0KvsOrzSHMrNhQiDytfyvkoA62kC7XK3yYXClKGD9uBzn1hVFRkohuhj1wVEIRbbiYD3wKfGyjkIhspnvLAbSQ8d~Ts1ZZUKqYAEUPl3ylUBXcgEJlvSa9FShxdXt3M-iDKLol7IrzsjU8SX8HYOvYj1T-743TMyAI65GcYBC13zI2QbVYIlZFQakcCoF4tPudG55NnXC7QIeqNKLEug84BtMCIVrw20tnn61ouJC~soAA__";



  handlerInput.responseBuilder.addVideoAppLaunchDirective(videoUrl, "", "");
  return handlerInput.responseBuilder.speak(speakOutput).getResponse();
};



async function challengeQuiz(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  var subConceptId = sessionAttributes.sub_concept_id;
  var studentName = sessionAttributes.studentName;
  var type = "quiz";
  const dataResponse = await getActions(studentId, subConceptId, type);

  if (!dataResponse.status) {
    return handlerInput.responseBuilder.speak("No Quiz Found").getResponse();
  }

  var quizQuestion = dataResponse.question_data[randomNumber()].question_text;

  var speechText =
    "OK <break time='100ms'/>" +
    studentName +
    " is quiz challenged with the following question <break time='100ms'/> " +
    quizQuestion +
    " we will notify you once " +
    studentName +
    " finish the quiz challenge ";
  speechText += conclude_message;
  sessionAttributes.state = states.CONCLUDE;
  var cardHeader = "Quiz Challenge"
  var cardContent = quizQuestion
  createNotification(studentId, 2, subConceptId);
  sessionAttributes.repeat_message = speechText;
  return handlerInput.responseBuilder
    .withShouldEndSession(false)
    .speak(speechText)
    .withSimpleCard(cardHeader, cardContent)
    .getResponse();
};


function sendingHIFI(handlerInput) {
  var speakOutput = "";
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  var subConceptId = sessionAttributes.sub_concept_id;
  var studentName = sessionAttributes.studentName;
  //  var message = {
  //    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
  //    to:"d2fDf2Fbq3U:APA91bEmZTG-JvQ3EpbjUsilKoPnOhod4TLqyNlkwLlWyEUxaQJyDACZR-68rO5YHIkeIL7EZ-iuCVxlJ6rZM5bqnvoE3Jon3uspXewiw6wlAS2D4hxxZprSBsMD-34iBDCkUVLpTCJV",

  //    notification: {
  //      title: "HI-FIVE",
  //      body: "you got a HI-Five from your parent"
  //    }
  //  };
  speakOutput =
    " Sending HI-FI to " + studentName + ' <break time="1s"/> Done';
  speakOutput += " " + conclude_message;
  createNotification(studentId, 1, subConceptId);
  sessionAttributes.repeat_message = speakOutput;
  return handlerInput.responseBuilder
    .speak(speakOutput)
    .withShouldEndSession(false)
    .getResponse();
};

function randomNumber() {
  var min = 0;
  var max = 4;
  return Math.floor(Math.random() * (max - min)) + min;
}

async function highlights(handlerInput) {
  const uiData = require("../screens/data/ReviseClassData.json");
  const uiTemplate = require("../screens/template/ReviseClassTemplate.json");

  // uiData.bodyTemplate1Data.menuListData.listPage.listItems = [];

  uiData.catFactData.backgroundImageUrl.url =
    "https://wallpaperaccess.com/full/212745.jpg";

  // uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
  //   "https://wallpaperaccess.com/full/212745.jpg";

  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  var subConceptId = sessionAttributes.sub_concept_id;
  var type = "highlights";
  const dataResponse = await getActions(studentId, subConceptId, type);

  if (!dataResponse.status) {
    return handlerInput.responseBuilder.speak("No Data Found").getResponse();
  }

  var cardHeader = "Reading Summary of " + dataResponse.concept_name;
  uiData.catFactData.title = cardHeader;
  var cardText = "";
  var highlights = dataResponse.highlights;
  var aplSpeakOutput = "Reading Summary of " + dataResponse.concept_name;
  var speakOutput = "Reading Summary of " + dataResponse.concept_name;

  uiTemplate.layouts.ListItemTemplate.items[0].items = [];
  for (var i = 0; i < highlights.length; i++) {
    speakOutput += '<break time="0.5s" />' + highlights[i]
    var highlightsText = i + 1 + '. ' + highlights[i];


    addTemplateTransformers(uiData, uiTemplate, i, highlightsText);

  }

  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);
  let audioEntityDirective = getAudioEntityDirective(highlights.length);

  // speakOutput += '<break time="0.5s" /> Thats it. Do you want a play a quiz or play a video ';
  sessionAttributes.repeat_message = speakOutput;

  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(aplSpeakOutput)
      .withShouldEndSession(false)
      .reprompt("Do you want a play a quiz or play a video")
      .addDirective(audioEntityDirective)
      .addDirective(uiEntityDirective)
      .getResponse();
  }
  else {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .reprompt("Do you want a play a quiz or play a video")
      .getResponse();
  }


};


async function reviseLastConceptSummary(handlerInput) {

  var speakOutput = "";
  speakOutput += "Revising Last Known Summary";


  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;

  //const response = await httpGet();
  const dataResponse = await getLastTopic(studentId);
  if (!dataResponse.status) {
    speakOutput = "No data found please try again";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
  }
  console.log(dataResponse);
  sessionAttributes.sub_concept_id = dataResponse.id;


  return highlights(handlerInput);
}

async function showLeaderBoard(handlerInput) {
  const uiData = require("../screens/data/LeaderBoardData.json");
  const uiTemplate = require("../screens/template/LeaderBoardTemplate.json");

  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  const dataResponse = await getLeaderBoardDatas(studentId);

  if (!dataResponse.status) {
    return handlerInput.responseBuilder.speak("No data Found").getResponse();
  }

  uiData.bodyTemplate1Data.backgroundImage.sources[0].url =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/03.jpg";
  uiData.bodyTemplate1Data.backgroundImage.sources[1].url =
    "https://wisdomleap-hls-playback.s3.amazonaws.com/images/03.jpg";
  var rankDatas = dataResponse.current_month;

  rankDatas.forEach(function (value, i) {

    uiData.bodyTemplate1Data.menuListData.listPage.listItems[
      i + 1
    ].textContent.primaryText.name = value.student_name;
    uiData.bodyTemplate1Data.menuListData.listPage.listItems[
      i + 1
    ].textContent.primaryText.grade = value.grade;
    uiData.bodyTemplate1Data.menuListData.listPage.listItems[
      i + 1
    ].textContent.primaryText.points = value.points;
  });

  var userScore = dataResponse.current_user_score;
  var totalScore = dataResponse.total;


  //var speakOutput = 'Showing Leader Board <break time="0.2s" /> ';
  var speakOutput = '';
  speakOutput += ' Your Score is <break time="0.2s" />  ' + userScore;
  speakOutput += '<break time="0.9s"/> you can say practice <break time="0.2s" /> or  <break time="0.2s" /> badges  <break time="0.2s" />';

  uiData.bodyTemplate1Data.footerContent.footerTitle = "Your Score : " + userScore;
  if (userScore < totalScore) {
    uiData.bodyTemplate1Data.footerContent.footerBody =
      "YOU ARE " +
      totalScore +
      " POINTS AWAY FROM MAKING AN ENTRY TO THE LEADERBOARD";
    speakOutput += '<break time="0.3s"/>';
    speakOutput +=
      " YOU ARE " + totalScore + " POINTS AWAY FROM MAKING AN ENTRY TO THE LEADERBOARD";
    speakOutput += '<break time="0.9s"/> you can say practice <break time="0.2s" /> or  <break time="0.2s" /> badges  <break time="0.2s" />';
  }

  else
    uiData.bodyTemplate1Data.footerContent.footerBody = "";



  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);


  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(uiEntityDirective)
      .withShouldEndSession(false)
      .getResponse();
  } else {
   
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
  }
}
async function showRewards(handlerInput) {
  const uiData = require("../screens/data/RewardData.json");
  const uiTemplate = require("../screens/template/RewardTemplate.json");



  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  const dataResponse = await getRewardsDatas(studentId);

  if (!dataResponse.status) {
    return handlerInput.responseBuilder.speak("No Rewards Found").getResponse();
  }
  uiData.bodyTemplate1Data.textContent.primaryText.text =
    "Showing Rewards of " + dataResponse.student_name;
  uiData.bodyTemplate1Data.menuListData.listPage.available_coins = "Available Coins - " + dataResponse.available_coins;
  uiData.bodyTemplate1Data.menuListData.listPage.coins_redeemed = "Coins Redeemed - " + dataResponse.redeedmed_rewards;
  uiData.bodyTemplate1Data.menuListData.listPage.coins_earned_today = "Coins Earned Today - " + dataResponse.today_coins;

  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);

  var speakOutput = "Showing Rewards of " + dataResponse.student_name;
  speakOutput +=
    '<break time="0.3s" /> Your available coins is ' +
    dataResponse.available_coins;

  speakOutput += '<break time="0.9s"/> you can say practice <break time="0.2s" /> or  <break time="0.2s" /> badges  <break time="0.2s" />';


  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(uiEntityDirective)
      .withShouldEndSession(false)
      .getResponse();
  } else {
    speakOutput =
      '<break time="0.3s" /> Your available coins is ' +
      dataResponse.available_coins;
      speakOutput += '<break time="0.9s"/> you can say practice <break time="0.2s" /> or  <break time="0.2s" /> badges  <break time="0.2s" />';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
  }
}

async function showBadges(handlerInput) {
  const uiData = require("../screens/data/BadgeData.json");
  const uiTemplate = require("../screens/template/BadgeTemplate.json");

  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  var studentId = sessionAttributes.student_id;
  const dataResponse = await getBadgeDatas(studentId);

  var badgeCount = 0;
  if (!dataResponse.status) {
    return handlerInput.responseBuilder.speak("No Badges Found").getResponse();
  }

  uiData.listTemplate2ListData.listPage.listItems = [];
  var data = dataResponse.data;
  data.forEach(function (value, i) {

    badgeCount += value.count;
    var badgeItem = {
      listItemIdentifier: "badge" + i,
      ordinalNumber: i + 1,
      textContent: {
        primaryText: {
          type: "PlainText",
          text: "Count : " + value.count
        },
        secondaryText: {
          type: "PlainText",
          text: value.badge_detail
        }
      },
      image: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url: value.badge_image,
            size: "small",
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url: value.badge_image,
            size: "large",
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      token: "badge" + i
    };


    uiData.listTemplate2ListData.listPage.listItems.push(
      badgeItem
    );

  });


  let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);

  var speakOutput = "";
  speakOutput +=
    "<audio src='soundbank://soundlibrary/musical/amzn_sfx_musical_drone_intro_02'/> ";
  speakOutput +=
    '<break time="0.3s" /> You have totally ' + badgeCount + ' badges';

  speakOutput += '<break time="0.9s"/> you can say practice <break time="0.2s" /> or  <break time="0.2s" /> rewards  <break time="0.2s" /> ';

  if (checkSupportedDisplay(handlerInput)) {
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective(uiEntityDirective)
      .withShouldEndSession(false)
      .getResponse();
  } else {
    // speakOutput =
    //   "<audio src='soundbank://soundlibrary/musical/amzn_sfx_musical_drone_intro_02'/> ";
    // speakOutput +=
    //   '<break time="0.3s" /> You have totally ' + badgeCount + " badges";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
  }


}


module.exports = {
  playVideo,
  highlights,
  challengeQuiz,
  sendingHIFI,
  showLeaderBoard,
  showRewards,
  showBadges,
  reviseLastConceptSummary
};
