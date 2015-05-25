'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var User = require('../models/user').User;

/**
 * @api {post} /user/register New user registration
 * @apiGroup User
 *
 * @apiParam {String} userId User's e-mail address
 * @apiParam {String} password User's password
 *
 * @apiVersion 1.0.0
 */
router.post('/register', function(req, res) {
  var userId = req.body.userId;
  var password = req.body.password;
  var energyPlatformID = req.body.energyPlatformID;

  User.register(new User({
    userId: userId,
    energyPlatformID: energyPlatformID
  }), password, function(err) {
    if (err) {
      return res.status(501).end('error while registering: ' + err);
    }

    res.end('successfully registered user: ' + userId);
  });
});

/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization Authorization token
 * @apiHeaderExample {String} Authorization-Example:
 *   "Authorization: Bearer 615ea82f7fec0ffaee5..."
 */

/**
 * @api {post} /user/info Get summary about yourself
 * @apiGroup User
 *
 * @apiUse Authorization
 *
 * @apiVersion 1.0.0
 */
router.get('/info', auth.authenticate(), function(req, res) {
  console.log(req.user);
  res.end('authenticated api path');
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
