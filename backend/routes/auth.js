'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var router = express.Router();
var passport = require('passport');

var User = require('../models').users; 

/**
 * @api {get} /auth/facebook Redirect to Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook', passport.authenticate('facebook',
	{scope :['user_friends', 'user_birthday', 'email', 'user_posts', 'publish_actions'], session: false}));

/**
 * @api {get} /auth/facebook/callback Callback URL for Facebook login
 * @apiGroup Facebook Login
 * 
 * @apiSuccess {Sting} [token] After the Facebook call back, the location is redirected to <code>/#/welcome/</code> followed by a user token if the  login is successful. The String value can be "fbUnauthorized", "err", or a user token. 
 */
router.get('/facebook/callback', passport.authenticate('facebook',
{ failureRedirect: process.env.YOUPOWER_REDIRECT_URL + "#/welcome/fbUnauthorized",
  session : false}), function(req, res) { 

  auth.newUserToken(req.user, function(err, token) { 

    if (err){
      res.redirect(process.env.YOUPOWER_REDIRECT_URL + '#/welcome/err'); 
    }else{
      res.redirect(process.env.YOUPOWER_REDIRECT_URL + '#/welcome/' + token); 
    }
  }); 
});


/**
 * @api {get} /auth/facebookc Connecting existing accounts with Facebook
 * @apiGroup Facebook Login
 */
router.get('/facebookc/:id', function(req, res, next) {
  console.log("req.params.id" + req.params.id);

  passport.authenticate('facebook-authz', 
	{ scope :['user_friends', 'user_birthday', 'email', 'user_posts', 'publish_actions'],  callbackURL: process.env.FACEBOOK_CALLBACK_URL + '/api/auth/facebook/callbackfb/' + req.params.id, 
    session: false
  })(req, res, next); 
});
 
/**
 * @api {get} /auth/facebook/callbackfb Callback URL for Facebook login for connection
 * @apiGroup Facebook Login
 * @apiSuccess {Sting} [res] After the Facebook call back, the location is redirected to <code>/#/app/settings/</code> followed by "fb" if the login is successful, "fbUnauthorized" otherwise. 
 */
router.get('/facebook/callbackfb/:id', function(req, res, next) {

  console.log("req.params.id" + req.params.id)

  passport.authenticate('facebook-authz',
	{callbackURL: process.env.FACEBOOK_CALLBACK_URL + '/api/auth/facebook/callbackfb/' + req.params.id, 
    failureRedirect: process.env.YOUPOWER_REDIRECT_URL + "#/app/settings/main/fbUnauthorized",
    session: false}, function(err, aUser) {

      console.log("user:" + JSON.stringify(aUser, null, 4));

      User.find({_id: req.params.id}, false, null, null, function(err, user) {
        if (err || !user) {
          res.redirect(process.env.YOUPOWER_REDIRECT_URL + '#/app/settings/main/fbUnauthorized'); 
        } else {
          user.facebookId  = aUser.facebookId;
          user.accessToken  = aUser.accessToken;
          user.profile.gender   = aUser.gender;
          user.profile.name   = aUser.name;
          user.profile.dob   = aUser.dob;

          user.markModified('profile.gender');
          user.markModified('profile.name');
          user.markModified('profile.dob');
          user.markModified('facebookId');
          user.markModified('accessToken');
          user.save();

          res.redirect(process.env.YOUPOWER_REDIRECT_URL + '#/app/settings/main/')
        }
      });
    }
  )(req, res, next); 

});

module.exports = router;
