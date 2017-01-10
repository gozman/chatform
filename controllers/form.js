const User = require('../models/User');
const Form = require('../models/Form');
const Responder = require('../models/Responder');
const request = require('request');
const Smooch = require('smooch-core');
const exporter = require('json-2-csv')
const jwt = require('jsonwebtoken');

function publishForm(state, access_token, res) {
  Form.findById(state, (err, theForm) => {
    if(err) {
      console.log(err);
      res.redirect("/forms");
    }

    theForm.smoochToken = access_token;
    theForm.save((err, result) => {
      //Create a webhook and point it at the
      var smooch = new Smooch({jwt:access_token});

      smooch.webhooks.create({
        target: process.env.CHATFORM_BASE_URL + '/bot/' + theForm._id,
        triggers: ['message:appUser']
      }).then((response) => {
        console.log(response);

        theForm.smoochWebHookId = response.webhook._id;
        theForm.save((err) => {
          if(err) {
            console.log(err);
            res.redirect('/forms');
          }

          res.redirect('/forms');
        });
      });
    })
  });
}


/**
 * GET /forms
 *
 */
 exports.getForms = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  Form.find({ownerId: req.user._id}, (err, docs) => {
      res.render('forms', { title: 'Your Forms', forms: docs});
  });
}

/**
 * GET /forms/new
 *
 */
exports.newForm = (req, res) => {
   if (!req.user) {
     return res.redirect('/login');
   }

   blankForm = {
     name: '',
     fields: {},
     startTrigger: '',
     endTrigger: '',
     startMessage: '',
     endMessage: ''
   }

   res.render('edit_form', {title: 'New Form', formInfo: blankForm});
}

/**
 * GET /forms/:formId
 *
 */
 exports.getForm = (req, res, next) => {
   if (!req.user) {
     return res.redirect('/login');
   }

   Form.findById(req.params.formId, (err, form) => {

     if(err) {
       console.log(err);
       return res.redirect('/forms');
     }

     if(form.ownerId != req.user._id.toString()) {
       console.log("oops!");
       return res.send(401, "You do not have access to this form.");
     }

    res.render('edit_form', { title: form.name, formInfo: form});
  });
};

/**
 * GET /forms/:formId/publish
 *
 */
exports.getPublishForm = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  console.log(req.params.formId);
  Form.findById(req.params.formId, (err, form) => {
    console.log(form);
    if(err) {
      console.log(err);
      return res.redirect('/forms');
    }

    if(form.ownerId != req.user._id.toString()) {
      console.log("oops!");
      return res.send(401, "You do not have access to this form.");
    }

    if(process.env.SMOOCH_CLIENT_ID && process.env.SMOOCH_CLIENT_ID.length > 0) {
      //oauth is supported...
      return res.redirect("https://app.smooch.io/oauth/authorize?client_id=chatform&response_type=code&state="+form._id);
    }

    res.render('publish_form', {title:form.name, formInfo: form});
 });
}

/**
 * GET /forms/:formId/publish
 *
 */
exports.postPublishForm = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  Form.findById(req.params.formId, (err, form) => {

    if(err || !req.body.secret || !req.body.keyId || !form) {
      console.log(err);
      return res.redirect('/forms');
    }

    if(form.ownerId != req.user._id.toString()) {
      console.log("oops!");
      return res.send(401, "You do not have access to this form.");
    }

    var token = "";
    if(req.body.secret.length && req.body.keyId.length) {
      jwt.sign({scope: 'app'}, req.body.secret, {header: {kid: req.body.keyId}});
    } else {
      console.log(form._id + " : invalid key and secret");
      return res.redirect('/forms');
    }

    var smooch = new Smooch({jwt: token});

    console.log("KEY: " + req.body.keyId);
    console.log("SECRET: " + req.body.secret);
    console.log("jwt: " + token);

    smooch.webhooks.list().then((response) => {
      console.log("ALL GOOD, PUBLISHING FORM...");
      console.log(response);
      return publishForm(form._id, token, res);
      console.log("BACK FROM PUBLISH FORM...");
    }, (err) => {
      console.log(err);
      res.redirect('/forms');
    });
 });
}

/**
 * POST /forms/:formId
 *
 */
exports.postForm = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  if(req.params.formId != "new") {
    Form.findById(req.params.formId, (err, form) => {
      if(err) {
        console.log(err);
        return res.redirect('/forms');
      }

      form.name = req.body.name;
      form.fields = JSON.parse(req.body.fields);
      form.startTrigger = req.body.startTrigger;
      form.startMessage = req.body.startMessage;
      form.endMessage = req.body.endMessage;
      form.endTrigger = req.body.endTrigger;

      theForm = form;

      form.save((err) => {
        if (err) { console.log(err); }
        res.redirect("/forms");
      });
    });
  } else {
    var theForm = new Form({
      ownerId: req.user._id,
      name: req.body.name,
      fields: JSON.parse(req.body.fields),
      startTrigger: req.body.startTrigger,
      startMessage: req.body.startMessage,
      endMessage: req.body.endMessage,
      endTrigger: req.body.endTrigger,
      responseCount: 0
    });

    theForm.save((err) => {
      if (err) { console.log(err); }
      res.redirect("/forms");
    });
  }
}

/**
 * GET /form/:formId/delete
 *
 */

exports.deleteForm = function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  Form.findById(req.params.formId, (err, form) => {

    if(err) {
      console.log(err);
      return res.redirect('/forms');
    }

    if(form.ownerId != req.user._id.toString()) {
      console.log("oops!");
      return res.send(401, "You do not have access to this form.");
    }

   form.remove((err) => {
     Responder.remove({formId: req.params.formId}, (err) => {
       if(err) {
         console.log(err);
         return res.sendStatus(500);
       }

       if(form.smoochToken && form.smoochWebHookId) {
         var smooch = new Smooch({jwt:form.smoochToken});
         smooch.webhooks.delete(form.smoochWebHookId).then((result) => {
           return res.redirect('/forms');
         }, (err) => {
           console.log(err);
           return res.sendStatus(500);
         });
       } else {
         return res.redirect('/forms');
       }
     });
   });
 });
}

/**
 * GET /form/:formId/responses
 *
 */
exports.getResponses = function(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }

  console.log("Searching for responder...");
  Responder.find({formId: req.params.formId}, (err, responders) => {
    if(err) {
      console.log(err);
      return res.redirect('/forms');
    }

    console.log("Searching for Form...");

    Form.findById(req.params.formId, (err, form) => {
      if(err) {
        console.log(err);
        return res.redirect('/forms');
      }

      console.log("Verifying...");
      if(form && form.ownerId != req.user._id.toString()) {
        console.log(forms[0]);
        console.log(req.user._id);
        return res.send(401, "You do not have access to this form.");
      }

      console.log("Building csv...");

      //Build clean csv
      var clean = [];
      var longestKeyArray = [];
      for(var i=0; i<responders.length; i++) {
        var response = responders[i].response;

        if(response) {
          response.givenName = responders[i].appUser.givenName;
          response.surname = responders[i].appUser.surname;
          response.platform = responders[i].appUser.clients[0].platform;
          response.date = responders[i].appUser.signedUpAt;
          response.appUserId = responders[i].appUser._id;

          console.log("RESPONSE " + i);
          console.log(response);

          if(Object.keys(response).length > longestKeyArray.length) {
            longestKeyArray = Object.keys(response);
          }

          clean.push(response);
        }
      }

      for(var i=0; i<clean.length; i++) {
        for(var j=0; j<longestKeyArray.length; j++) {
          if(!clean[i][longestKeyArray[j]]) {
            clean[i][longestKeyArray[j]] = '';
          }
        }
      }

      exporter.json2csv(clean, (err, csv) => {
        if(err) {
          console.log(err);
          return res.sendStatus(500);
        }

        res.set('Content-Type', 'text/csv');
        res.send(csv);

      }, {
          emptyFieldValue: '',
          delimiter:{
            'wrap':'"'
          }
        });
    });
 });
}


/**
 * Exchanges an authorization code, yields an access token.
 */
function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    request.post(`https://api.smooch.io/oauth/token`, {
      form: {
        code: code,
        grant_type: 'authorization_code',
        client_id: process.env.SMOOCH_CLIENT_ID,
        client_secret: process.env.SMOOCH_SECRET
      }
    }, (err, http, body) => {
      if (err) {
        return reject(err);
      }

      try {
        console.log(JSON.stringify(body, null, 2));

        const {access_token} = JSON.parse(body);
        resolve(access_token);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * GET /connect-to-smooch
 * OAUTH Redirect.
 */
exports.oauthCallabck = (req, res) => {
  if (req.query.error) {
      console.log(req.query.error);
      res.error(req.query.error);
  } else {
    const code = req.query.code;
    const state = req.query.state;

    //Exchange code for access token
    exchangeCode(code).then((access_token) => {
      console.log("GOT AN ACCESS TOKEN: " + access_token);

      return publishForm(state, access_token, res);
    }, (err) => {
      console.log(err);
      res.redirect('/forms');
    });
  }
};
