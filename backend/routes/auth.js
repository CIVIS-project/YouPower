'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var router = express.Router();
var passport = require('passport');

/**
 * @api {get} /auth/facebook Redirect to Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook', passport.authenticate('facebook',
	{scope :['user_friends', 'user_birthday', 'email', 'publish_actions'], session: false}));

/**
 * @api {get} /auth/facebook/callback Callback URL for Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook/callback', passport.authenticate('facebook',
{session : false}), function(req, res) {
  auth.newUserToken(req.user, function(err, token) {
    res.successRes(err, {
      token: token
    });
  });
});
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.

/**
 * @api {get} /auth/facebookc Connecting existing accounts with fb
 * @apiGroup Facebook Login
 */
router.get('/facebookc', passport.authorize('facebook-authz',
	{scope :'email', session: false}));

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
