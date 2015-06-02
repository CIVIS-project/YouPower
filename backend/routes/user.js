'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var crypto = require('crypto');
var util = require('util');
var escapeRegexp = require('escape-string-regexp');
var router = express.Router();
var User = require('../models/user').User;

router.use('/action', require('./userAction'));
router.use('/challenge', require('./userChallenge'));

/**
 * @api {post} /user/register New user registration
 * @apiGroup User
 *
 * @apiParam {String} userId User's e-mail address
 * @apiParam {String} name User's nickname
 * @apiParam {String} password User's password
 *
 * @apiVersion 1.0.0
 */
router.post('/register', function(req, res) {
  req.checkBody('userId').notEmpty();
  req.checkBody('password').notEmpty();
  req.checkBody('name').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.register(new User({
      userId: req.body.userId,
      profile: {
        name: req.body.name
      }
    }), req.body.password, function(err) {
      if (err) {
        return res.status(501).end('error while registering: ' + err);
      }

      res.end('successfully registered user: ' + req.body.userId);
    });
  }
});

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization Authorization token
 * @apiHeaderExample {String} Authorization-Example:
 *   "Authorization: Bearer 615ea82f7fec0ffaee5..."
 */

/**
 * @api {get} /user/profile Get your profile
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 */
router.get('/profile', auth.authenticate(), function(req, res) {
  res.json({
    userId: req.user.userId,
    profile: req.user.profile,
    energyConsumption: {},
    topActions: [],
    topChallenges: [],
    topCommunities: [],
    topFriends: []
  });
});

/**
 * @api {post} /user/profile Update your profile
 * @apiGroup User
 *
 * @apiParam {String} [name] Your nickname
 * @apiParam {Date} [dob] Your date of birth
 * @apiParam {String} [email] Your email
 * @apiParam {String} [photo] Profile photo
 *
 * @apiVersion 1.0.0
 */
router.post('/profile', auth.authenticate(), function(req, res) {
  req.checkBody('name').optional().notEmpty();
  req.checkBody('email').optional().notEmpty();
  req.checkBody('photo').optional().notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    // update any fields that are defined
    req.user.profile.name  =  req.body.name  || req.user.profile.name;
    req.user.profile.dob   =  req.body.dob   || req.user.profile.dob;
    req.user.profile.email =  req.body.email || req.user.profile.email;
    req.user.profile.photo =  req.body.photo || req.user.profile.photo;

    req.user.save(function(err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({
          profile: req.user.profile
        });
      }
    });
  }
});

/**
 * @api {get} /user/profile/:userId Get another user's profile
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 */
router.get('/profile/:userId', auth.authenticate(), function(req, res) {
  var query = User.findOne({userId: req.params.userId});

  query.select('profile userId');

  query.exec(function(err, user) {
    if (err) {
      res.status(500).json(err);
    } else if (!user) {
      res.status(404).json({
        err: 'User not found'
      });
    } else {
      res.json({
        userID: user.userId,
        profile: user.profile,
        energyConsumption: {},
        topActions: [],
        topChallenges: [],
        topCommunities: []
      });
    }
  });
});

/**
 * @api {get} /user/search Search for users
 * @apiGroup User
 *
 * @apiParam {String} q Search query
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://localhost:3000/api/user/search\?q\=foobar
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "users": [
 *       {
 *         "_id": "5562c1d46b1083a13e5b7843",
 *         "userId": "testUser",
 *         "profile": {
 *           ...
 *         }
 *       },
 *       ...
 *     ]
 *   }
 *
 * @apiVersion 1.0.0
 */
router.get('/search', auth.authenticate(), function(req, res) {
  req.checkQuery('q', 'Invalid query parameter').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    var regexpQuery = new RegExp(escapeRegexp(req.query.q));

    var query = User.find({
      $or: [
        {'profile.name':  regexpQuery},
        {'userId':        regexpQuery}
      ]
    });

    query.select('profile userId');
    query.limit(50);

    query.exec(function(err, users) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({
          users: users
        });
      }
    });
  }
});

/**
 * @api {post} /user/token Generate new API token
 * @apiGroup User
 *
 * @apiHeader {String} Authorization HTTP Basic Authentication credentials
 * @apiHeaderExample {String} Authorization-Example:
 *   "Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=="
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "token": "615ea82f7fec0ffaee5..."
 *   }
 *
 * @apiVersion 1.0.0
 */
router.get('/token', auth.basicauth(), function(req, res) {
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
