'use strict';

var auth = require('../middleware/auth');
//var util = require('util');
var express = require('express');
var router = express.Router();
//var User = require('../models/user').User;
var Action = require('../models/action');

/**
 * @api {get} /user/action Get user's action list
 * @apiGroup User Action
 *
 * @apiVersion 1.0.0
 */
router.get('/', auth.authenticate(), function(req, res) {
  res.json(req.user.actions);
});

/**
 * @api {post} /user/action/start/:actionId Start an action for current user
 * @apiGroup User Action
 *
 * @apiParam {String} actionId Action's MongoId
 *
 * @apiVersion 1.0.0
 */
router.post('/start/:actionId', auth.authenticate(), function(req, res) {
  Action.get(req.params.actionId, function(err, actionResult) {
    if (err) {
      res.status(500).json({err: err});
    } else if (!actionResult) {
      res.status(404).json({err: 'Action not found'});
    } else {
      // store this action in inProgress list
      console.log(actionResult);
      req.user.actions.inProgress[req.params.actionId] = actionResult;
      var action = req.user.actions.inProgress[req.params.actionId];

      action.startedDate = new Date();

      // get rid of the action in other lists
      delete(req.user.actions.done[req.params.actionId]);
      delete(req.user.actions.canceled[req.params.actionId]);

      // must be manually marked as modified due to mixed type schemas
      req.user.markModified('actions.inProgress');
      req.user.markModified('actions.done');
      req.user.markModified('actions.canceled');
      req.user.save(function(err, user) {
        if (err) {
          res.status(500).json({err: err});
        } else {
          res.json({user: user});
        }
      });
    }
  });
});

/**
 * @api {post} /user/action/cancel/:actionId Cancel an action for current user
 * @apiGroup User Action
 * @apiDescription Note: action must be currently in progress.
 *
 * @apiParam {String} actionId Action's MongoId
 *
 * @apiVersion 1.0.0
 */
router.post('/cancel/:actionId', auth.authenticate(), function(req, res) {
  var action = req.user.actions.inProgress[req.params.actionId];

  if (!action) {
    res.status(404).json({err: 'Action not in progress'});
  } else {
    // store this action in canceled list
    req.user.actions.canceled[req.params.actionId] = action;

    action.canceledDate = new Date();

    // get rid of the action in other lists
    delete(req.user.actions.done[req.params.actionId]);
    delete(req.user.actions.inProgress[req.params.actionId]);

    // must be manually marked as modified due to mixed type schemas
    req.user.markModified('actions.inProgress');
    req.user.markModified('actions.done');
    req.user.markModified('actions.canceled');
    req.user.save(function(err, user) {
      if (err) {
        res.status(500).json({err: err});
      } else {
        res.json({user: user});
      }
    });
  }
});

/**
 * @api {post} /user/action/complete/:actionId Complete an action for current user
 * @apiGroup User Action
 * @apiDescription Note: action must be currently in progress.
 *
 * @apiParam {String} actionId Action's MongoId
 *
 * @apiVersion 1.0.0
 */
router.post('/complete/:actionId', auth.authenticate(), function(req, res) {
  var action = req.user.actions.inProgress[req.params.actionId];

  if (!action) {
    res.status(404).json({err: 'Action not in progress'});
  } else {
    // store this action in done list
    req.user.actions.done[req.params.actionId] = action;

    action.doneDate = new Date();

    // get rid of the action in other lists
    delete(req.user.actions.canceled[req.params.actionId]);
    delete(req.user.actions.inProgress[req.params.actionId]);

    // must be manually marked as modified due to mixed type schemas
    req.user.markModified('actions.inProgress');
    req.user.markModified('actions.done');
    req.user.markModified('actions.canceled');
    req.user.save(function(err, user) {
      if (err) {
        res.status(500).json({err: err});
      } else {
        res.json({user: user});
      }
    });
  }
});

module.exports = router;
