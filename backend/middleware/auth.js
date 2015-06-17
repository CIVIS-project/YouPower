'use strict';

var winston = require('winston');
var l = winston.loggers.get('default');
var mongoose = require('mongoose');
var crypto = require('crypto');

var passport = require('passport');

var BearerStrategy = require('passport-http-bearer');
var BasicStrategy = require('passport-http').BasicStrategy;
var FacebookStrategy = require('passport-facebook');
var User = require('../models').users;

exports.genToken = function(cb) {
  crypto.randomBytes(48, function(ex, buf) {
    cb(buf.toString('hex'));
  });
};

exports.newUserToken = function(user, cb) {
  exports.genToken(function(token) {
    user.token = token;
    user.save(function(err) {
      cb(err, token);
    });
  });
};

exports.initialize = function() {
  passport.use(new BasicStrategy(User.authenticate()));
  passport.use(new BearerStrategy(function(token, done) {
    if (!token) {
      return done('No token provided');
    }

    User.find({token: token}, false, null, null, function(err, user) {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  }));

  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    l.warn('Facebook login not set up. Please set environment variables:');
    l.warn('FACEBOOK_APP_ID');
    l.warn('FACEBOOK_APP_SECRET');
    l.warn('FACEBOOK_CALLBACK_URL');
    l.warn('Disabling Facebook login.');
  } else {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL ||
        'http://localhost:3000/api/auth/facebook/callback',
      enableProof: false
    }, function(accessToken, refreshToken, profile, done) {
      User.find({facebookId: profile.id}, false, null, null, function(err, user) {
        if (err) {
          return done(err);
        } else if (!user) {
          // TODO: refactor this mess
          // user does not exist, register new user
          crypto.randomBytes(48, function(ex, buf) {
            var password = buf.toString('hex');
            console.log(profile);
            User.register({
              // TODO: get email via facebook
              email: mongoose.Types.ObjectId(),
              facebookId: profile.id,
              profile: {
                name: profile.displayName,
                gender: profile.gender
              }
            }, password, function(err) {
              if (err) {
                return done(err);
              }

              User.find({facebookId: profile.id}, false, null, null, function(err, user) {
                if (err) {
                  return done(err);
                } else if (!user) {
                  return done('user not found after registering! should never happen');
                }
                return done(null, user);
              });
            });
          });
        } else {
          return done(err, user);
        }
      });
    }));
  }

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

exports.facebook = function() {
  return passport.authenticate('facebook', {session: false});
};
