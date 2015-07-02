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
//    if (!process.env.FACEBOOK_APP_ID) {
    l.warn('Facebook login not set up! Please set environment variables:');
    l.warn('FACEBOOK_APP_ID');
    l.warn('FACEBOOK_APP_SECRET');
    l.warn('FACEBOOK_CALLBACK_URL');
    l.warn('Disabling Facebook login.');
  } else 
  {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/api/auth/facebook/callback",
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log("profile",profile);
    //console.log("profile",profile);
        process.nextTick(function () {
        User.find({facebookId: profile.id}, false, null, null, function(err, user) {
            if (err) {
                      return done(err);
                      } 

            else if(user) {
                  console.log("From facebook/callback");
                  return done(err, user);
                }
            else{
          
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
                profile: {
                  name: profile.displayName,
                  gender: profile.gender
                }
              }, password, function(err,user) {
                if (err) {
                  return done(err);
                }
                console.log("\n");
                console.log("data",user);
                return done(null,user);
              
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
    callbackURL: "http://localhost:3000/api/auth/facebook/callbackfb"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("Authorization success profile",profile);
    

    User.find({token: "3b6a60944460403f077312fc6989c592e32176d40422415cc811a6c284549fb076e680e997632720a54b8689f602f776"}, false, null, null, function(err, user) {
            if (err) {
                      console.log("ERROR");
                      return done(err);
                      } 

            else if(!user) {
                  console.log("The given token does not exist for the user");
                  return done(err, "The given user does not exist");
                }
            else{
                console.log("USER",user);
                user.facebookId  = profile.id;
                user.profile.gender   = profile.gender;

                user.markModified('profile.gender');
                user.markModified('facebookId');
                user.save();
                //console.log("USERUPDATED",user);
                return done(null,"Facebook account successfully connected");
          
            }

            
            });
  }
));
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
 return function(req,res)
  {
    auth.passport("facebook",{session: false})
    console.log(req.user);
  };
};
exports.facebookcb = function() {
  return passport.authenticate('facebook', {session: false});
};
exports.connectFb = function(user) {
  console.log("connectFB fn");
  
  return passport.authorize('facebook-authz', { scope: ['email'],session: false},function(req,res){
    console.log("I hope this works");
  });
// return passport.authenticate('facebook', { scope: ['email'],session: false});
  //return passport.authenticate('facebook', { scope: ['email'],session: false});
};