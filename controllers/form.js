const User = require('../models/User');
const Form = require('../models/Form');
const request = require('request');

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
 * Contact form page.
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
    }).catch((err) => {
      console.log(err);
      res.redirect('/forms');
    });

  }

  res.redirect("/forms");
};
