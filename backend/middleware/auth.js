'use strict';

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user').User;

exports.initialize = function() {
  passport.use(new BasicStrategy(User.authenticate()));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  return passport.initialize();
};

exports.authenticate = function() {
  return passport.authenticate('basic', {session: false});
};
