'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var router = express.Router();

/**
 * @api {get} /auth/facebook Redirect to Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook', auth.facebook(), function() {
	
  // user is redirected to facebook, do nothing here
});

router.get('/facebook/connect', auth.connectFb("test"), function() {
	
  // user is redirected to facebook, do nothing here
});
/**
 * @api {get} /auth/facebook/callback Callback URL for Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook/callback', auth.facebook(), function(req, res) {
	
  auth.newUserToken(req.user, function(err, token) {
    res.successRes(err, {
      token: token
    });
  });
});

module.exports = router;
