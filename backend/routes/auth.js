'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var router = express.Router();
var passport = require('passport');
var YOUPOWER_REDIRECT_URL = "https://app.civisproject.eu/frontend.html";
// var YOUPOWER_REDIRECT_URL = "http://localhost:8100/";

/**
 * @api {get} /auth/facebook Redirect to Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook', passport.authenticate('facebook',
	{scope :['user_friends', 'user_birthday', 'email', 'publish_actions'], session: false}));

/**
 * @api {get} /auth/facebook/callback Callback URL for Facebook login
 * @apiGroup Facebook Login
 * 
 * @apiSuccess {Sting} [token] After the Facebook call back, the location is redirected to <code>/#/welcome/</code> followed by a user token if the  login is successful. The String value can be "fbUnauthorized", "err", or a user token. 
 */
router.get('/facebook/callback', passport.authenticate('facebook',
{ failureRedirect: YOUPOWER_REDIRECT_URL + "#/welcome/fbUnauthorized",
  session : false}), function(req, res) { 

  auth.newUserToken(req.user, function(err, token) { 

    if (err){
      res.redirect(YOUPOWER_REDIRECT_URL + '#/welcome/err'); 
    }else{
      res.redirect(YOUPOWER_REDIRECT_URL + '#/welcome/' + token); 
    }
  }); 
});


/**
 * @api {get} /auth/facebookc Connecting existing accounts with fb
 * @apiGroup Facebook Login
 */
router.get('/facebookc', passport.authorize('facebook-authz',
	{scope :['user_friends', 'user_birthday', 'email', 'publish_actions'], session: false}));

/**
 * @api {get} /auth/facebook/callbackfb Callback URL for Facebook login for connection
 * @apiGroup Facebook Login
 */
router.get('/facebook/callbackfb', passport.authorize('facebook-authz',
	{session: false}), function(req, res) {

  res.successRes(null, {
    Status: req.account
  });
});

module.exports = router;
