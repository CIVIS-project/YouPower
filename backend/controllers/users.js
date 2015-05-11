'use strict';

var express = require('express');
var router = express.Router();
var User = require('../models/user').User;

// user registration
router.put('/register', function(req, res) {
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
