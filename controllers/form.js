const User = require('../models/User');
const Form = require('../models/Form');
const request = require('request');

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
 * GET /forms/:formId
 *
 */
 exports.getForm = (req, res, next) => {
   Form.findById(req.params.formId, (err, formInfo) => {
         if(err) {
           console.log(err);
           return res.redirect('/forms');
         }

         if(hookInfo.owner != req.user._id.toString()) {
           return res.send(401, "You do not have access to this webhook.");
         }

        req.session['current_form'];
        res.render('edit_form', { title: formInfo.name, form: formInfo });
  });

  res.redirect("/forms");
};

/**
 * POST /forms/:formId
 *
 */
exports.postForm = (req, res, next) => {
  res.json("{'postForm':'unimplemented'}");
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
    const props = config;
    const code = req.query.code;

    //Exchange code for access token
    exchangeCode(code).then((access_token) => {
      Form.findById(req.session['current_form'], (err, theForm) => {
        theForm.smoochToken = access_token;
        theForm.save((err, result) => {
          res.redirect('/forms');
        })
      });
    }, (err) => {
      console.log(err);
      res.redirect('/forms');
    });

  }

  res.redirect("/forms");
};
