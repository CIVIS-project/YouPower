'use strict';

var auth = require('../middleware/auth');
//var util = require('util');
var express = require('express');
var router = express.Router();
var Log = require('../models').logs;
//var User = require('../models/user').User;
//var Challenge = require('../models/challenge');

/**
 * @api {get} /user/challenge Get user's challenge list
 * @apiGroup User Challenge
 *
 * @apiVersion 1.0.0
 */
router.get('/', auth.authenticate(), function(req, res) {
  res.json(req.user.challenges);

  Log.create({
    userId: req.user._id,
    category: 'User Challenge',
    type: 'get',
    data: {}
  });
});

/**
 * @api {post} /user/challenge/start/:challengeId Start an challenge for current user (TODO)
 * @apiGroup User Challenge
 *
 * @apiParam {String} challengeId Challenge's MongoId
 *
 * @apiVersion 1.0.0
 */
router.post('/start/:challengeId', auth.authenticate(), function(req, res) {
  // TODO!!
  res.status(501).send('Not implemented');
  /*
  Challenge.get(req.params.challengeId, function(err, challengeResult) {
    if (err) {
      res.status(500).json({err: err});
    } else if (!challengeResult) {
      res.status(404).json({err: 'Challenge not found'});
    } else {
      // store this challenge in inProgress list
      req.user.challenges.inProgress[req.params.challengeId] = challengeResult;
      var challenge = req.user.challenges.inProgress[req.params.challengeId];

      challenge.startedDate = new Date();

      // get rid of the challenge in other lists
      delete(req.user.challenges.done[req.params.challengeId]);
      delete(req.user.challenges.canceled[req.params.challengeId]);

      // must be manually marked as modified due to mixed type schemas
      req.user.markModified('challenges.inProgress');
      req.user.markModified('challenges.done');
      req.user.markModified('challenges.canceled');
      req.user.save(function(err, user) {
        if (err) {
          res.status(500).json({err: err});
        } else {
          res.json({user: user});
        }
      });
    }
  });
  Log.create({
    userId: req.user._id,
    category: 'User Challenge',
    type: 'start',
    data: req.params
  });
  */
});

/**
 * @api {post} /user/challenge/cancel/:challengeId Cancel an challenge for current user (TODO)
 * @apiGroup User Challenge
 * @apiDescription Note: challenge must be currently in progress.
 *
 * @apiParam {String} challengeId Challenge's MongoId
 *
 * @apiVersion 1.0.0
 */
router.post('/cancel/:challengeId', auth.authenticate(), function(req, res) {
  res.status(501).send('Not implemented');
  /*
  var challenge = req.user.challenges.inProgress[req.params.challengeId];

  if (!challenge) {
    res.status(404).json({err: 'Challenge not in progress'});
  } else {
    // store this challenge in canceled list
    req.user.challenges.canceled[req.params.challengeId] = challenge;

    challenge.canceledDate = new Date();

    // get rid of the challenge in other lists
    delete(req.user.challenges.done[req.params.challengeId]);
    delete(req.user.challenges.inProgress[req.params.challengeId]);

    // must be manually marked as modified due to mixed type schemas
    req.user.markModified('challenges.inProgress');
    req.user.markModified('challenges.done');
    req.user.markModified('challenges.canceled');
    req.user.save(function(err, user) {
      if (err) {
        res.status(500).json({err: err});
      } else {
        res.json({user: user});
      }
    });
    Log.create(...
  }
  */
});

module.exports = router;
