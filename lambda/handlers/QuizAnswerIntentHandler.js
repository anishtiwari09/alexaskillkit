const { states, sub_states, speechConsCorrect, speechConsWrong } = require("../Constants");
const { getUIEntityDirective } = require("../Utils/CommonUtilMethods");
const { saveQuizResponse } = require("../Utils/HttpUtils");

const Constants = require("../Constants");
const {
  quizResultVoiceExpression,
  studentQuizChallengeValuate,
  toMainMenu,
  getHelpMessage
} = require("../Utils/CommonUtilMethods");
const { valuateQuizCricketAnswer } = require("../Utils/QuizCricketGameMethods");


const QuizAnswerIntentHandler = {
  canHandle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;
    return (
      // attributes.state === states.QUIZ &&

      request.type === "IntentRequest" &&
      request.intent.name === "AnswerIntent" &&
      (attributes.state === states.QUIZ ||
        attributes.state === states.CHALLENGE_QUIZ ||
        (attributes.state === states.GAME_QUIZ_CRICKET && attributes.sub_state === sub_states.GAME_RESUME)
      )
    );
  },
  async handle(handlerInput) {
   
    const uiData = require("../screens/data/QuizScreenData.json");
    const uiTemplate = require("../screens/template/QuizScreenTemplate.json");

    const response = handlerInput.responseBuilder;
    const slot = handlerInput.requestEnvelope.request.intent.slots;
    var speechText = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var resolutionsPerAuth =
      handlerInput.requestEnvelope.request.intent.slots["answer"]
        .resolutions.resolutionsPerAuthority;
    
  
    var optionId = resolutionsPerAuth[0].values[0].value.id;
    // const userAnswer = slot["answer"].value.toLowerCase().replace(".", "");
    var userAnswer = "";
    if (optionId == 0) {
      userAnswer = "a";
    }
    else {
      userAnswer = "b";
    }


  
    if (sessionAttributes.state === states.GAME_QUIZ_CRICKET) {
      return valuateQuizCricketAnswer(handlerInput, userAnswer);
    }

    if (sessionAttributes.state === states.CHALLENGE_QUIZ) {
      return studentQuizChallengeValuate(handlerInput, userAnswer);
    }
    else if (sessionAttributes.state === states.QUIZ) {
   

      var choiceId = "";
      if (userAnswer == "a")
        choiceId = sessionAttributes.choice_id_a;
      else
        choiceId = sessionAttributes.choice_id_b;



      const dataResponse = await saveQuizResponse(sessionAttributes.quiz_id,
        sessionAttributes.student_id,
        sessionAttributes.sub_concept_id,
        sessionAttributes.question_id,
        choiceId,
        5);
      console.log("Save Quiz Response",dataResponse);


      let speechText = determineCorrectAnswer(
        userAnswer,
        sessionAttributes,
        dataResponse.correct
      );

      if (!dataResponse.status) {
        speakOutput = "No quiz  found for your account. " + Constants.conclude_message;
        sessionAttributes.state = states.CONCLUDE;
        sessionAttributes.repeat_message = speakOutput;
        return handlerInput.responseBuilder
          .withShouldEndSession(false)
          .speak(speakOutput)
          .getResponse();
      }



      if (dataResponse.quiz_status == "In Progress") {

        var questionSet = dataResponse.question_data[0];
        var cardHeader = "Quiz";
        speechText += getNextQuestion(questionSet,sessionAttributes);
        var cardText = getCardText(questionSet);
        sessionAttributes.repeat_message = getNextQuestion(questionSet,sessionAttributes);


        sessionAttributes.question_id = questionSet.question_id;

        sessionAttributes.choice_id_a = questionSet.choices[0].id;
        sessionAttributes.choice_id_b = questionSet.choices[1].id;



        var questionDisplay = "Question No : " + dataResponse.question_no + " / 5" + " | Score : " +
          dataResponse.correct;
        uiData.bodyTemplate1Data.textContent.primaryText.text = questionDisplay;

        
        uiData.bodyTemplate1Data.menuListData.listPage.question =
          "Q: " + questionSet.question_text;

        uiData.bodyTemplate1Data.menuListData.listPage.option_a =
          "A. " + questionSet.choices[0].choices;
        uiData.bodyTemplate1Data.menuListData.listPage.option_b =
          "B. " + questionSet.choices[1].choices;


        let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);
        return response
          .speak(speechText)
          .withShouldEndSession(false)
          .reprompt(speechText)
          .addDirective(uiEntityDirective)
          .getResponse();
        // return handlerInput.responseBuilder
        //   .withShouldEndSession(false)
        //   .speak("Speech")
        //   .getResponse();
      }
      else {


        sessionAttributes.state = states.QUIZ_NONE;

        uiData.bodyTemplate1Data.textContent.primaryText.text =
          "Thats all for now";
        var cardText = "";
        sessionAttributes.quiz_score = dataResponse.correct;
        if (dataResponse.correct <= Constants.winning_score) {

          speechText +=
            ' <break time="0.5s" /> Thats all for now  your score can be better. ';
          speechText +=  '<break time="0.9s"/> do you want to <break time="0.2s" />  watch a video lesson <break time="0.2s" />';
          sessionAttributes.state = states.VIDEO;
          uiData.bodyTemplate1Data.menuListData.listPage.question =
            "your score can be better.";

          uiData.bodyTemplate1Data.menuListData.listPage.option_a =
            "Score : " + dataResponse.correct;
          uiData.bodyTemplate1Data.menuListData.listPage.option_b =
            " ";

        } else {
          speechText +=
            ' <break time="0.5s" /> Thats all for now . ' +
            ". Well done. Do you want to share the score with your parent ? ";
          sessionAttributes.state = states.SHARE_SCORE;
          cardText +=
            "Well done. \r\n Do you want to share the score with your parent ? ";


          uiData.bodyTemplate1Data.menuListData.listPage.question =
            "Well done.";

          uiData.bodyTemplate1Data.menuListData.listPage.option_a =
            "Score : " + dataResponse.correct;
          uiData.bodyTemplate1Data.menuListData.listPage.option_b =
            "Do you want to share the score with your parent ?";
        }
        sessionAttributes.help_message = Constants.yes_or_no_help_message;
        sessionAttributes.repeat_message = speechText;
        sessionAttributes.page = 0;

        let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);

        return response
          .speak(speechText)
          .withShouldEndSession(false)
          .reprompt(speechText)
          .addDirective(uiEntityDirective)
          .getResponse();
        // return handlerInput.responseBuilder
        //   .withShouldEndSession(false)
        //   .speak("Speech")
        //   .getResponse();
      }


      if (sessionAttributes.question_count < 4) {
        var questionCountLabel = sessionAttributes.question_count + 1;
        var cardHeader = "Quiz";
        speechText += getNextQuestion(handlerInput);
        var cardText = getCardText(handlerInput);
        sessionAttributes.repeat_message = speechText;


        var question =
          sessionAttributes.questions[sessionAttributes.question_count];
        var choices = question.choices;



        var questionCountDisplay = sessionAttributes.question_count + 1;
        var questionDisplay = "Question No : " + questionCountDisplay + " / 5" + " | Score : " +
          sessionAttributes.quiz_score;;
        uiData.bodyTemplate1Data.textContent.primaryText.text = questionDisplay;

        uiData.bodyTemplate1Data.menuListData.listPage.question =
          "Q: " + question.question_text;

        uiData.bodyTemplate1Data.menuListData.listPage.option_a =
          "A. " + choices[0].choices;
        uiData.bodyTemplate1Data.menuListData.listPage.option_b =
          "B. " + choices[1].choices;


        let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);
        return response
          .speak(speechText)
          .withShouldEndSession(false)
          .reprompt(speechText)
          .addDirective(uiEntityDirective)
          .getResponse();
      } else {
        sessionAttributes.state = states.QUIZ_NONE;
        sessionAttributes.questions = "";
        uiData.bodyTemplate1Data.textContent.primaryText.text =
          "Thats all for now";
        var cardText = "";
        if (sessionAttributes.quiz_score <= Constants.winning_score) {

          speechText +=
            ' <break time="0.5s" /> Thats all for now . Your score is too low. ' +
            "Do you want to revise the lesson ? ";
          sessionAttributes.state = states.VIDEO;
          uiData.bodyTemplate1Data.menuListData.listPage.question =
            "Your score is too low.";

          uiData.bodyTemplate1Data.menuListData.listPage.option_a =
            "Score : " + sessionAttributes.quiz_score;
          uiData.bodyTemplate1Data.menuListData.listPage.option_b =
            "Do you want to revise the lesson ?";

        } else {
          speechText +=
            ' <break time="0.5s" /> Thats all for now . ' +
            ". Well done. Do you want to share the score with your parent ? ";
          sessionAttributes.state = states.SHARE_SCORE;
          cardText +=
            "Well done. \r\n Do you want to share the score with your parent ? ";


          uiData.bodyTemplate1Data.menuListData.listPage.question =
            "Well done.";

          uiData.bodyTemplate1Data.menuListData.listPage.option_a =
            "Score : " + sessionAttributes.quiz_score;
          uiData.bodyTemplate1Data.menuListData.listPage.option_b =
            "Do you want to share the score with your parent ?";
        }
        sessionAttributes.help_message = Constants.yes_or_no_help_message;
        sessionAttributes.repeat_message = speechText;

        let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);

        return response
          .speak(speechText)
          .withShouldEndSession(false)
          .reprompt(speechText)
          .addDirective(uiEntityDirective)
          .getResponse();
      }
    }

    else {
      var repeatMessage = sessionAttributes.repeat_message;
     
      return toMainMenu(handlerInput);
    }

  }
};


function getNextQuestion(questionSet,sessionAttributes) {
  
  var question = questionSet.utterance;
  var choices = questionSet.choices;

  var current_question =
    question +
    getOptionSpeechTest("A") +
    choices[0].utterance +
    getOptionSpeechTest("B") +
    choices[1].utterance;

  if (choices[0].correct) sessionAttributes.current_answer = "a";
  else sessionAttributes.current_answer = "b";

  return ` <break time="2s" />${current_question}`;
}


function getCardText(questionSet) {

  var question = questionSet.question_text;
  var choices = questionSet.choices;

  let text = "";
  text += 'Q: ' + question + "\r\n";

  text += "A. " + choices[0].choices + "\r\n";
  text += "B. " + choices[1].choices + "\r\n";

  return text;
}


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function determineCorrectAnswer(userAnswer, sessionAttributes, quizScore) {
  console.log("User Answer",sessionAttributes.current_answer)
  if (userAnswer === sessionAttributes.current_answer) {

    var itsCorrectMessage = speechConsCorrect[getRandomInt(10)];
    var correctTone = quizResultVoiceExpression(true, itsCorrectMessage)
    return (
      '<audio src="soundbank://soundlibrary/human/amzn_sfx_large_crowd_cheer_02"/>' +
      correctTone +
      " ! Option  " +
      userAnswer.toUpperCase() +
      "  is correct. " +
      "Your score is " +
      quizScore
    );
  } else {
    var itsWrongMessage = speechConsWrong[getRandomInt(10)];
    var wrongTone = quizResultVoiceExpression(false, itsWrongMessage);
    return (
      '<audio src="soundbank://soundlibrary/cartoon/amzn_sfx_boing_long_1x_01"/>' +
      wrongTone +
      " ! Option " +
      userAnswer.toUpperCase() +
      " is Incorrect." +
      " Your score is " +
      quizScore
    );
  }
}

function getOptionSpeechTest(value) {
  return (
    '<break time="0.3s" /> Option<break time="0.2s" /> <say-as interpret-as="spell-out">' +
    value +
    "</say-as> "
  );
}

module.exports = QuizAnswerIntentHandler;
