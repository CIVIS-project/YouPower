'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var crypto = require('crypto');
var router = express.Router();

/**
 * @api {get} /auth/facebook Redirect to Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook', auth.facebook(), function() {
  // user is redirected to facebook, do nothing here
});

/**
 * @api {get} /auth/facebook/callback Callback URL for Facebook login
 * @apiGroup Facebook Login
 */
router.get('/facebook/callback', auth.facebook(), function(req, res) {
  crypto.randomBytes(48, function(ex, buf) {
    var token = buf.toString('hex');
    req.user.token = token;
    req.user.save(function(err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({
          token: token
        });
      }
    });
  });
});

module.exports = router;
