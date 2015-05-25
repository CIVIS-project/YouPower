'use strict';

var passport = require('passport');
var BearerStrategy = require('passport-http-bearer');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user').User;

exports.initialize = function() {
  passport.use(new BasicStrategy(User.authenticate()));
  passport.use(new BearerStrategy(function(token, done) {
    if (!token) {
      return done('No token provided');
    }

    User.findOne({token: token}, function(err, user) {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  }));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  return passport.initialize();
};

exports.basicauth = function() {
  return passport.authenticate('basic', {session: false});
};

exports.authenticate = function() {
  return passport.authenticate('bearer', {session: false});
};
