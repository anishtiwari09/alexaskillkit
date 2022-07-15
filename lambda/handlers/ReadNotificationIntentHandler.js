const { states } = require("../Constants");
const {
  ReadStudentNotification,
  ReadParentNotification
} = require("../Utils/NotificationUtilMethods");
const { openMainMenu } = require("../Utils/CommonUtilMethods");
const ReadNotificationIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "ReadNotificationIntent"
    );
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    console.log("Session Attributes");
    console.log(sessionAttributes.IS_STUDENT);
    if (typeof sessionAttributes.IS_STUDENT !== "undefined") {
        if (sessionAttributes.IS_STUDENT) {
          return ReadStudentNotification(handlerInput);
        } else {
          return ReadParentNotification(handlerInput);
        }
    }
    else
    {
          return openMainMenu(handlerInput);
    }
  
  }
};

module.exports = ReadNotificationIntentHandler;