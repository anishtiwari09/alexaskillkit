const { Config } = require("aws-sdk");
const axios = require("axios");
const config = require("../config");
async function getUserInfo(accessToken)
{
    var path =
      config.BASE_URL +
      "new_device_users/get_parent_info?access_token=" +
      accessToken;
    console.log(path);  
   let dataResponse = await axios.get(path);
   console.log("Respppp : ",dataResponse);
   return dataResponse.data;
}


async function startQuizQuestion(student_id, sub_concept_id){
  const res = await axios.get(config.BASE_URL+"new_device_students/start_quiz", { params: { student_id,sub_concept_id } });
  console.log("Quiz Start : ",res);
  return res.data;
}

async function saveQuizResponse(quiz_id, student_id, sub_concept_id, question_id, choice_id, time_spent){
  const res = await axios.get(config.BASE_URL+"new_device_students/save_alexa_quiz_response", { params: { quiz_id, student_id, sub_concept_id, question_id, choice_id, time_spent } });
  console.log("Quiz Answer Response");
  console.log(res);
  return res.data;
}

async function getConceptVideo(student_id, sub_concept_video_id){
  const res = await axios.get(config.BASE_URL+"new_device_students/alexa_concept_video", { params: { student_id, sub_concept_video_id } });
  console.log(res);
  return res.data;
}
async function logErrorMessage(access_token,message){
  const res = await axios.get(config.BASE_URL+"app_students/create_alexa_error_logs", { params: { access_token, message } });
  console.log(res);
  return res.data;
}

async function getActions(studentId, subConceptId, type) {
  var  path = 
        config.BASE_URL+"new_device_students/alexa_actions?type=" +
        type + 
        "&student_id="+studentId+"&sub_concept_id="+subConceptId;
   
   let dataResponse = await axios.get(path);
   console.log("Respppp : ",dataResponse);
   return dataResponse.data;
}

async function getChallengeQuiz(notificationId) {
  var path =
    config.BASE_URL +
    "new_device_students/alexa_challenge_question?alexa_user_notification_id=" +
    notificationId;

  let dataResponse = await axios.get(path);
  console.log("Respppp : ",dataResponse);
  return dataResponse.data;
}

 function updateNotification(notificationId) {
  var path =
    config.BASE_URL +
    "new_device_users/update_alexa_user_notification?alexa_user_notification_id=" +
    notificationId;

  let dataResponse =  axios.get(path);
}
 async function createNotification(studentId,notificationId,conceptId) {
  var path =
    config.BASE_URL +
    "new_device_users/create_alexa_user_notification?student_id=" +
    studentId +
    "&notification_id=" +
    notificationId +
    "&concept_id=" +
    conceptId;
    console.log("Create Notification");
    console.log(path);
    let dataResponse = await axios.get(path);
    
    console.log(dataResponse);
}
 async function submitQuizChallenge(notificationId, questionId, choiceId) {
  var path =
    config.BASE_URL +
    "new_device_students/alexa_challenge_quiz_creation?alexa_user_notification_id=" +
    notificationId +
    "&question_id=" +
    questionId +
    "&student_choice_id=" +
    choiceId;
 
   let dataResponse =   await axios.get(path);
   console.log("Quiz Creation");
     console.log(path);
  console.log(dataResponse);
}

async function getQuizQuestions(studentId, subConceptId, type) {
   var path =
     config.BASE_URL +
     "new_device_students/alexa_actions?type=" +
        type +
        "&student_id=" +
        studentId +
        "&sub_concept_id=" +
        subConceptId;

   let dataResponse = await axios.get(path);
   console.log("Respppp : ",dataResponse);
   return dataResponse.data;
}


async function shareQuizToParents(parentId,studentId,subConceptId,score)
{
  var path =
    config.BASE_URL +
    "new_device_students/share_quiz_score_to_parents?student_id=" +
    studentId +
    "&parent_id=" +
    parentId +
    "&sub_concept_id=" +
    subConceptId +
    "&score=" +
    score;

  let dataResponse = await axios.get(path);
  console.log("Share Score");
  console.log(path);
  console.log(dataResponse);
}

async function getConceptByName(conceptName,page,type,studentId){
  var path =
    config.BASE_URL +
    "app_students/find_concepts?name=" +
    conceptName +
    "&page=" +
    page +
    "&type=" +
    type +
    "&student_id="+
    studentId
    ;
  let dataResponse = await axios.get(path);
  console.log("Respppp : ",dataResponse);
    return dataResponse.data;
}

async function getLeaderBoardDatas(studentId){
   var path =
     config.BASE_URL + "app_students/leader_board?student_id=" + studentId;
   let dataResponse = await axios.get(path);
   return dataResponse.data;
}

async function getRewardsDatas(studentId){
  var path = config.BASE_URL + "app_students/rewards?student_id=" + studentId;
  let dataResponse = await axios.get(path);
  return dataResponse.data;
}
async function getBadgeDatas(studentId) {
  var path = config.BASE_URL + "app_students/badges?student_id=" + studentId;
  let dataResponse = await axios.get(path);
  return dataResponse.data;
}
async function getLastTopic(studentId) {
  var path =
    config.BASE_URL + "app_students/revised_chapter?student_id=" + studentId;
  let dataResponse = await axios.get(path);
  return dataResponse.data;
}


module.exports = {
  getUserInfo,
  getActions,
  getChallengeQuiz,
  updateNotification,
  submitQuizChallenge,
  createNotification,
  shareQuizToParents,
  getQuizQuestions,
  startQuizQuestion,
  getConceptByName,
  saveQuizResponse,
  getLeaderBoardDatas,
  getConceptVideo,
  getRewardsDatas,
  getBadgeDatas,
  getLastTopic,
  logErrorMessage
};
