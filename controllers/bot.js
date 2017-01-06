const User = require('../models/User');
const Form = require('../models/Form');
const Responder = require('../models/Responder');
const request = require('request');
const Smooch = require('smooch-core');

/**
 * POST /bot/:formId
 *
 */
function sendSmoochMessage = (appUser, message) => {
  return smooch.appUsers.sendMessage(appUser._id, {
      role: 'appMaker',
      type: 'text',
      text: message
  })
}

exports.postMessage = (req, res, next) => {
  //Get form
  Form.findById(req.params.formId, (err, form) => {
    if(err) {
      console.log(err);
      return res.sendStatus(500);
    }

    //Log in to Smooch
    const smooch = new Smooch({jwt: form.smoochToken});

    //Look up responder
    const appUser = req.body.appUser;
    Responder.findOne({'appUserId' : appUser._id}, (err, responder) => {

      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      if(!responder) {
        responder = new Responder({
          formId: req.params.formId,
          appUserId: appUser._id,
          appUser: appUser
        });

        responder.response = {};
      } else {
        //The message contained an answer to something that we want to track!
        var questionIndex = 0;

        if(responder.response) {
          questionIndex = Object.keys(responder.response).length;
          if(questionIndex >= form.fields.length) {
            return res.sendStatus(200);
          }
        } else {
          responder.response = {};
        }

        responder.response[form.fields[questionIndex].question] = req.body.messages[0].text;
        responder.markModified('response');
      }

      //console.log("SAVING RESPONDER: " + JSON.stringify(responder, null, 2));

      //Save response
      responder.save((err) => {
        if(err) {
          console.log(err);
          return res.sendStatus(500);
        }

        //Send next question or gtfo
        if(Object.keys(responder.response).length === form.fields.length) {
          //All questions have been answered

          Responder.count({formId: form._id}, (err, count) => {
            form.responseCount = count;
            form.save((err) => {
              if(form.endMessage && form.endMessage.length) {
                sendSmoochMessage(appUser, form.endMessage).then((response) => {
                  return res.sendStatus(200);
                }, (error) => {console.log(err); res.sendStatus(500);});
              } else {
                return res.sendStatus(200);
              }
            });
          });
        } else if(Object.keys(responder.response).length == 0) {
          //Starting off the survey
          if(form.startMessage && form.startMessage.length) {
            sendSmoochMessage(appUser, form.startMessage).then((response) => {
              sendSmoochMessage(appUser, form.fields[0].question).then((response) => {
                return res.sendStatus(200);
              }, (error) => {console.log("SEND FIRST QUESTION ERROR " + err); return res.sendStatus(500);});
            }, (error) => {console.log("START MESSAGE ERROR " + err); return res.sendStatus(500);});
          } else {
            sendSmoochMessage(appUser, form.fields[0].question).then((response) => {
              return res.sendStatus(200);
            }, (error) => {console.log("PATH B ERROR"); console.log(err); res.sendStatus(500);});
          }
        } else {
          //Mid survey!
          sendSmoochMessage(appUser, form.fields[Object.keys(responder.response).length].question).then((response) => {
            return res.sendStatus(200);
          });
        }

      });

    });
});
}
