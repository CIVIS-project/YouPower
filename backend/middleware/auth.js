'use strict';

var winston = require('winston');
var l = winston.loggers.get('default');
var crypto = require('crypto');

var passport = require('passport');

var BearerStrategy = require('passport-http-bearer');
var BasicStrategy = require('passport-http').BasicStrategy;
var FacebookStrategy = require('passport-facebook');
var User = require('../models').users;
var FB = require('fb');

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
  passport.use(new BasicStrategy(User.model.authenticate()));
  passport.use(new BearerStrategy(function(token, done) {
    if (!token) {
      return done('No token provided');
    }

    User.model.findOne({token: token}, function(err, user) {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  }));

  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    l.warn('Facebook login not set up! Please set environment variables:');
    l.warn('FACEBOOK_APP_ID');
    l.warn('FACEBOOK_APP_SECRET');
    l.warn('FACEBOOK_CALLBACK_URL');
    l.warn('Disabling Facebook login.');
  } else {
    passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL+'/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'gender', 'email', 'birthday'],
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log("profile",profile);
    //console.log("accessToken",accessToken);
    process.nextTick(function() {
      User.find({email: profile._json.email}, false, null, null, function(err, user) {
        //console.log('user',user);
        if (err) {
          return done(err);
        } else if (user) {
          user.accessToken = accessToken;
          user.markModified('accessToken');
          user.save();
          return done(err, user);
        } else {
          // TODO: refactor this mess
          // user does not exist, register new user
          crypto.randomBytes(48, function(ex, buf) {
              var password = buf.toString('hex');
              //console.log('profile',profile);
              User.register({
                  // TODO: get email via facebook
                  email: profile.emails[0].value,
                  //email: mongoose.Types.ObjectId(),
                  facebookId: profile.id,
                  accessToken:accessToken,
                  profile: {
                  name: profile.displayName,
                  gender: profile.gender,
                  dob: profile._json.birthday
                }
                }, password, function(err, user) {
                  if (err) {
                    return done(err);
                  }
                  return done(null, user);

                });
            });
        }
      });

    });
  }
));

    //Code for connecting fb account with existing account
    passport.use('facebook-authz', new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL+'/api/auth/facebook/callbackfb',
      profileFields: ['id', 'displayName', 'gender', 'email', 'birthday']
    },
    function(accessToken, refreshToken, profile, done) {
      var tk = 'token come here';
      User.find({token: tk}, false, null, null, function(err, user) {
        if (err) {
          return done(err);
        } else if (!user) {
          return done(err, 'The given user does not exist');
        } else {
          user.facebookId  = profile.id;
          user.accessToken  = accessToken;
          user.profile.gender   = profile.gender;

          user.markModified('profile.gender');
          user.markModified('facebookId');
          user.markModified('accessToken');
          user.save();
          //console.log("USERUPDATED",user);
          return done(null, 'Facebook account successfully connected');
        }
      });
    }));
  }
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  return passport.initialize();
};
var acct='CAAUWthYSwZCIBADLEo6RSYdHykpijeWKwi8DZCCl5HiiANtVB7gFdrHXkA6ZAhCxsukDTqWd9t72VkWo48niHzs4eGLO9NmqUqITzOUFCdSpZAcVGqsoQrI212dKjFO17LkXExoxdjH5dh8wPaCEZBC05ckxMZCyKRRc4J7ZCerW2Oy7Hlkw9XijgUU1xDhTVZB1mEnoHO1RlAZDZD';
FB.setAccessToken(acct);
FB.api('me/friends', { fields: ['id', 'name'], accessToken: acct}, function (res) {
  if(!res || res.error) {
   console.log(!res ? 'error occurred' : res.error);
   return;
  }
  console.log(res);
  console.log(res.name);
});

/*var body = 'My first post using facebook-node-sdk';
FB.api('me/feed', 'post', { message: body}, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log('Post Id: ' + res.id);
});*/

exports.basicauth = function() {
  return passport.authenticate('basic', {session: false});
};

exports.authenticate = function() {
  return passport.authenticate('bearer', {session: false});
};
