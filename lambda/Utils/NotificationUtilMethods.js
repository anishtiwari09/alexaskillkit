const { states,conclude_message } = require("../Constants");
const { updateNotification } = require("./HttpUtils");

var cardContent = "";
var cardHeader = "beGalileo";


function isNotificationAvailable(handlerInput)
{
 
   var notificationCount = 0;
   const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if(sessionAttributes.IS_STUDENT)
    {
      var conceptPracticed =
        sessionAttributes.dataResponse.student_data[0].concept_practiced;
      conceptPracticed.forEach(function(value) {
        notificationCount += value.unseen_notifications.length;
        console.log("Notification Length " + value.unseen_notifications.length);
      });
      return notificationCount;
    }
    else
    {
        var parentData =
          sessionAttributes.dataResponse.parent_data;
        parentData.forEach(function(value) {
          notificationCount += value.unseen_notifications.length;
          console.log(
            "Notification Length " + value.unseen_notifications.length
          );
        });
        return notificationCount;
    }
}
function NotificationAlert(handlerInput)
{
        var speechText = "You have a notification do you want to check it"
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.state = states.NOTIFICATION;
         sessionAttributes.repeat_message = speechText;
        return handlerInput.responseBuilder
          .withShouldEndSession(false)
          .speak(speechText)
          .getResponse();
}



function ReadStudentNotification(handlerInput)
{
    const { stripTags, getHelpMessage } = require("./CommonUtilMethods");
    
       const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
       var speakOutput = " ";

      var studentData = sessionAttributes.dataResponse.student_data[0];
      var notificationUnseen =
        studentData.concept_practiced[0].unseen_notifications;
      if (notificationUnseen.length < 1) {
        speakOutput = "You don't have any notification right now ";
          sessionAttributes.repeat_message = speakOutput;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .withShouldEndSession(false)
          .reprompt(getHelpMessage(handlerInput))
          .getResponse();``
      }
      if (notificationUnseen[0].name === "highfy") {
          updateNotification(notificationUnseen[0].id);
        speakOutput = "Wow! You got a <break time='200ms'/> hi-fi from your parent";
        cardHeader = "Hi-Five"
        speakOutput += " "+conclude_message;
        sessionAttributes.state = states.CONCLUDE;
           sessionAttributes.repeat_message = speakOutput;
        return handlerInput.responseBuilder
          .withSimpleCard(cardHeader, stripTags(speakOutput))
          .withShouldEndSession(false)
          .reprompt(getHelpMessage(handlerInput))
          .speak(speakOutput)
          .getResponse();
      }

      if (notificationUnseen[0].name === "quiz_challenge") {
        sessionAttributes.state = states.CHALLENGE_QUIZ;
        speakOutput =
          "You have a quiz challenge from your parent <break time='200ms'/> do you want to take it?";
          cardHeader = "Quiz Challenge";
        
          cardContent = stripTags(speakOutput);
             sessionAttributes.repeat_message = speakOutput;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .withShouldEndSession(false)
          .withSimpleCard(cardHeader, cardContent)
          .getResponse();
      }

      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
}

function ReadParentNotification(handlerInput)
{
  const { stripTags, getHelpMessage } = require("./CommonUtilMethods");
  console.log("Inside parent Notification");
    var speakOutput = ""
     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
     var parentData = sessionAttributes.dataResponse.parent_data[0];
     var notificationUnseen =
       parentData.unseen_notifications;
        console.log("Unseen Notification "+notificationUnseen.length);
    if (notificationUnseen.length < 1) {
      speakOutput = "You don't have any notification right now";
         sessionAttributes.repeat_message = speakOutput;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .reprompt(getHelpMessage(handlerInput))
        .getResponse();
    }
    if (notificationUnseen[0].name === "quiz_challenge_completion") {
       var speakOutput =
         "Wow! <break time='200ms'/>"
        if (notificationUnseen[0].status === "success")
        {
            speakOutput +=
              sessionAttributes.studentName +
              " won the quiz challenge";
        }
        else
        {
            speakOutput += sessionAttributes.studentName + " failed the quiz challenge";
        }
        speakOutput += " "+conclude_message;
           sessionAttributes.repeat_message = speakOutput;
        sessionAttributes.state = states.CONCLUDE;
         updateNotification(notificationUnseen[0].id);
                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .withSimpleCard(cardHeader,stripTags(speakOutput))
                        .withShouldEndSession(false)
                        .getResponse();
     }
      if (notificationUnseen[0].name === "share_score") {
        var speakOutput = "Hai <break time='200ms'/>";
        speakOutput +=
          sessionAttributes.studentName +
          " played a quiz game and scored " +
          notificationUnseen[0].score +
          " out of 5";
          speakOutput += " " + conclude_message;
          sessionAttributes.state = states.CONCLUDE;
        updateNotification(notificationUnseen[0].id);
           sessionAttributes.repeat_message = speakOutput;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .withSimpleCard(cardHeader, stripTags(speakOutput))
          .withShouldEndSession(false)
          .getResponse();
      }


    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
}


module.exports = {
  isNotificationAvailable,
  NotificationAlert,
  ReadStudentNotification,
  ReadParentNotification
};