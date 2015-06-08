'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var util = require('util');
var escapeRegexp = require('escape-string-regexp');
var router = express.Router();
var User = require('../models/user');

router.use('/action', require('./userAction'));
router.use('/challenge', require('./userChallenge'));

/**
 * @api {post} /user/register New user registration
 * @apiGroup User
 *
 * @apiParam {String} email User's e-mail address
 * @apiParam {String} name User's nickname
 * @apiParam {String} password User's password
 *
 * @apiVersion 1.0.0
 */
router.post('/register', function(req, res) {
  req.checkBody('email').notEmpty();
  req.checkBody('password').notEmpty();
  req.checkBody('name').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.register({
      email: req.body.email,
      profile: {
        name: req.body.name
      }
    }, req.body.password, function(err, user) {
      if (err) {
        return res.status(500).end('error while registering: ' + err);
      }

      auth.newUserToken(user, function(err, token) {
        res.successRes(err, {
          token: token
        });
      });
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
  User.getProfile(req.user._id, res.successRes);
});

/**
 * @api {post} /user/profile Update your profile
 * @apiGroup User
 *
 * @apiParam {String} [name] Your nickname
 * @apiParam {Date} [dob] Your date of birth
 * @apiParam {String} [photo] Profile photo
 *
 * @apiVersion 1.0.0
 */
router.post('/profile', auth.authenticate(), function(req, res) {
  req.checkBody('name').optional().notEmpty();
  req.checkBody('photo').optional().notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    User.updateProfile(req.user, req.body, res.successRes);
  }
});

/**
 * @api {get} /user/profile/:id Get another user's profile
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 */
router.get('/profile/:id', auth.authenticate(), function(req, res) {
  User.getProfile(req.params.id, res.successRes);
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
 *         "email": "testUser@foo.com",
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

    User.find({
      $or: [
        {'profile.name':  regexpQuery},
        {'email':        regexpQuery}
      ]
    }, true, 50, null, res.successRes);
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
router.post('/token', auth.basicauth(), function(req, res) {
  auth.newUserToken(req.user, function(err, token) {
    res.successRes(err, {
      token: token
    });
  });
});

/**
 * @api {get} /user/token Get current API token
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
  res.successRes(req.user.token ? null : 'User token not found', {
    token: req.user.token
  });
});

module.exports = router;
