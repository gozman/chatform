const User = require('../models/User');
const Form = require('../models/Form');
const Responder = require('../models/Responder');
const request = require('request');
const Smooch = require('smooch-core');

var kue = require('kue');
var queue = kue.createQueue({redis: process.env.REDIS_URL});

/**
 * POST /bot/:formId
 *
 */
exports.postMessage = (req, res, next) => {
  //Get form
  Form.findById(req.params.formId, (err, form) => {
    if(err) {
      console.log(err);
      return res.sendStatus(500);
    }

    queue.create('bot_dispatch', {
      appUser: req.body.appUser,
      messageText: req.body.messages[0].text,
      headers: req.headers,
      formId: req.params.formId
    }).save(function(err) {
      if(err){console.log(err)};
    });

    res.sendStatus(200);
  });
}
