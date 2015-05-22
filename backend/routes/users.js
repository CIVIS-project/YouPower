'use strict';

var express = require('express');
var router = express.Router();
var User = require('../models/user').User;

/**
 * @api {post} /users/register New user registration
 * @apiGroup Users
 *
 * @apiParam {String} username User's e-mail address
 * @apiParam {String} password User's password
 *
 * @apiVersion 1.0.0
 */
router.post('/register', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var energyPlatformID = req.body.energyPlatformID;

  User.register(new User({
    username: username,
    energyPlatformID: energyPlatformID
  }), password, function(err) {
    if (err) {
      return res.status(501).end('error while registering: ' + err);
    }

    res.end('successfully registered user: ' + username);
  });
});

module.exports = router;
