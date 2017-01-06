var kue = require('kue');
var jobs = kue.createQueue({redis: process.env.REDIS_URL});
const mongoose = require('mongoose');
const Form = require('./models/Form');
const Responder = require('./models/Responder');
const Smooch = require('smooch-core');

/**
 * Connect to MongoDB.
 */
 mongoose.Promise = global.Promise;
 mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
 mongoose.connection.on('error', () => {
   console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
   process.exit();
 });


  function sendSmoochMessage(s, appUser, message) {
    //Are we sending a plain message?
    if(message && message.question) {
      if(message.answers.length) {
        var quickReplies = [];

        for(var i=0; i<message.answers.length; i++) {
          qr = {
            type: 'reply',
            text: message.answers[i],
            payload: message.answers[i]
          }

          quickReplies.push(qr);
        }

        return s.appUsers.sendMessage(appUser._id, {
            role: 'appMaker',
            type: 'text',
            text: message.question,
            actions: quickReplies
          });
    } else {
      //Recursive, because that's how I roll...
      return sendSmoochMessage(s, appUser, message.question);
    }
    } else {
      return s.appUsers.sendMessage(appUser._id, {
          role: 'appMaker',
          type: 'text',
          text: message
      })
    }
  }


    jobs.process("bot_dispatch", (job,done) => {
        //Look up responder
        const appUser = job.data.appUser;

        Form.findById(job.data.formId, (err, form) => {
          if(err) {
            console.log(err);
            done();
          }

          //Log in to Smooch
          const smooch = new Smooch({jwt: form.smoochToken});
          Responder.findOne({'appUserId' : appUser._id}, (err, responder) => {
            if (err) {
              console.log(err);
              done();
            }

            if(!responder) {
              responder = new Responder({
                formId: job.data.formId,
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
                  done();
                }
              } else {
                responder.response = {};
              }

              responder.response[form.fields[questionIndex].question] = job.data.messageText;
              responder.markModified('response');
            }

            //console.log("SAVING RESPONDER: " + JSON.stringify(responder, null, 2));

            //Save response
            responder.save((err) => {
              if(err) {
                console.log(err);
                done();
              }

              //Send next question or gtfo
              if(Object.keys(responder.response).length === form.fields.length) {
                //All questions have been answered

                Responder.count({formId: form._id}, (err, count) => {
                  form.responseCount = count;
                  form.save((err) => {
                    if(form.endMessage && form.endMessage.length) {
                      sendSmoochMessage(smooch, appUser, form.endMessage).then((response) => {
                        done();
                      }, (error) => {console.log(err); res.sendStatus(500);});
                    } else {
                      done();
                    }
                  });
                });
              } else if(Object.keys(responder.response).length == 0) {
                //Starting off the survey
                if(form.startMessage && form.startMessage.length) {
                  sendSmoochMessage(smooch, appUser, form.startMessage).then((response) => {
                    sendSmoochMessage(smooch, appUser, form.fields[0]).then((response) => {
                      done();
                    }, (error) => {console.log("SEND FIRST QUESTION ERROR " + err); return res.sendStatus(500);});
                  }, (error) => {console.log("START MESSAGE ERROR " + err); return res.sendStatus(500);});
                } else {
                  sendSmoochMessage(smooch, appUser, form.fields[0]).then((response) => {
                    done();
                  }, (error) => {console.log("PATH B ERROR"); console.log(err); res.sendStatus(500);});
                }
              } else {
                //Mid survey!
                sendSmoochMessage(smooch, appUser, form.fields[Object.keys(responder.response).length]).then((response) => {
                  done();
                });
              }
            });
          });
        });
      });
