const { states } = require("../Constants");
const { getQuizQuestions, startQuizQuestion } = require("../Utils/HttpUtils");
const Constants = require("../Constants");
const { getUIEntityDirective } = require("../Utils/CommonUtilMethods");


const QuizIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "QuizIntent"
    );
  },
  async handle(handlerInput) {



    const uiData = require("../screens/data/QuizScreenData.json");
    const uiTemplate = require("../screens/template/QuizScreenTemplate.json");

    var speakOutput = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;
    var studentId = sessionAttributes.student_id;
    var subConceptId = sessionAttributes.sub_concept_id;
    //  var studentId = 41913;
    //  var subConceptId = 5411;
    var type = "quiz";




    // const dataResponse = await getQuizQuestions(studentId, subConceptId, type);
    // console.log("Data Response");
    // console.log(dataResponse);

    const dataResponse = await startQuizQuestion(studentId, subConceptId);
    console.log("Data Response");
    console.log(dataResponse);




    if (!dataResponse.status) {
      speakOutput = "No quiz data found for your account. " + Constants.conclude_message;
      sessionAttributes.state = states.CONCLUDE;
      sessionAttributes.repeat_message = speakOutput;
      return response
        .withShouldEndSession(false)
        .speak(speakOutput)
        .getResponse();
    }
    var questions = dataResponse.question_data[0];

    sessionAttributes.dataResponse = "";

    sessionAttributes.question_count = 0;
    sessionAttributes.quiz_score = dataResponse.correct;
    sessionAttributes.state = states.QUIZ;
    sessionAttributes.quiz_id = dataResponse.quiz_id;
    sessionAttributes.question_id = questions.question_id;
   
    sessionAttributes.choice_id_a = questions.choices[0].id;
    sessionAttributes.choice_id_b = questions.choices[1].id;



    var cardText = "";
    cardText += 'Q: ' +
      questions.question_text + "\r\n";

    var current_question =
      '<break time="0.3s" />' +
      questions.utterance;

    console.log("Question Start Utterance");
    console.log(questions.utterance);

    var choices = questions.choices;
    console.log("Came Here 2");
    if (choices[0].correct) sessionAttributes.current_answer = "a";
    else sessionAttributes.current_answer = "b";

    var questionCountLabel = sessionAttributes.question_count + 1;
    var cardHeader = "Quiz";

    cardText += "A. " + choices[0].choices + "\r\n";
    cardText += "B. " + choices[1].choices + "\r\n";
    console.log("DataRep", dataResponse.question_no);

    var questionCountDisplay = dataResponse.question_no;
    var questionDisplay =
      "Question No : " +
      questionCountDisplay +
      " / 5 " +
      " | Score : " +
      dataResponse.correct;
    uiData.bodyTemplate1Data.textContent.primaryText.text = questionDisplay;

    uiData.bodyTemplate1Data.menuListData.listPage.question =
      questions.question_text;
    uiData.bodyTemplate1Data.menuListData.listPage.option_a =
      "A. " + choices[0].choices;
    uiData.bodyTemplate1Data.menuListData.listPage.option_b =
      "B. " + choices[1].choices;

    speakOutput =
      "<audio src='soundbank://soundlibrary/musical/amzn_sfx_musical_drone_intro_02'/> ";

    speakOutput += 'bingo<break time="0.3s" />';

    speakOutput +=
      'Starting Quiz<break time="0.3s" /> You can say Option A or Option B .Here is the Question : ' +
      current_question +
      getOptionSpeechTest("A") +
      choices[0].utterance +
      getOptionSpeechTest("B") +
      choices[1].utterance;

    const rePromptQuestion =
      current_question +
      getOptionSpeechTest("A") +
      choices[0].utterance +
      getOptionSpeechTest("B") +
      choices[1].utterance;
    sessionAttributes.help_message = Constants.option_help_message;
    sessionAttributes.repeat_message = rePromptQuestion;




    let uiEntityDirective = getUIEntityDirective(uiTemplate, uiData);




    // return handlerInput.responseBuilder
    //       .speak("Hello")
    //       .reprompt("Hai again")
    //       .getResponse();

    return response
      .speak(speakOutput)
      .reprompt(rePromptQuestion)
      .withShouldEndSession(false)
      .addDirective(uiEntityDirective)
      .getResponse();
  }
};

function getOptionSpeechTest(value) {
  return (
    '<break time="0.3s" /> Option<break time="0.2s" /> <say-as interpret-as="spell-out">' +
    value +
    "</say-as> "
  );
}



module.exports = QuizIntentHandler;