const User = require('../models/User');
const Form = require('../models/Form');
const request = require('request');
const Smooch = require('smooch-core');

/**
 * GET /forms
 *
 */
 exports.getForms = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  Form.find({ownerId: req.user._id}, (err, docs) => {
      res.render('forms', { title: 'Your Forms', forms: docs });
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
   Form.findById(req.params.formId, (err, form) => {

     if(err) {
       console.log(err);
       return res.redirect('/forms');
     }

     if(form.ownerId != req.user._id.toString()) {
       console.log("oops!");
       return res.send(401, "You do not have access to this form.");
     }

    req.session['current_form'] = form._id;
    res.render('edit_form', { title: form.name, formInfo: form});
  });
};

/**
 * POST /forms/:formId
 *
 */
exports.postForm = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  var form;

  if(req.params.formId != "new") {
    return res.json("{'postForm':'unimplemented'}");
  } else {
    form = new Form({
      ownerId: req.user._id,
      name: req.body.name,
      fields: req.body.fields
    });
  }

  form.save((err) => {
    if (err) { console.log(err); }
    res.redirect("/forms");
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

    //Exchange code for access token
    exchangeCode(code).then((access_token) => {
      console.log("GOT AN ACCESS TOKEN: " + access_token);

      Form.findById(req.session['current_form'], (err, theForm) => {
        theForm.smoochToken = access_token;
        theForm.save((err, result) => {
          //Create a webhook and point it at the
          var smooch = new Smooch({jwt:access_token});

          console.log(process.env.CHATFORM_BASE_URL + '/bot/' + theForm._id);
          
          smooch.webhooks.create({
            target: process.env.CHATFORM_BASE_URL + '/bot/' + theForm._id,
            triggers: ['message:appUser']
          }).then((response) => {
            console.log(response);
            res.redirect('/forms');
          });
        })
      });
    }, (err) => {
      console.log(err);
      res.redirect('/forms');
    });
  }
};
