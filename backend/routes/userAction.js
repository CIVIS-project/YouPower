'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var router = express.Router();
var User = require('../models').users;
var Action = require('../models').actions;
var Log = require('../models').log;

/**
 * @api {get} /user/action Get user's action list
 * @apiGroup User Action
 *
 * @apiVersion 1.0.0
 */
router.get('/', auth.authenticate(), function(req, res) {
  res.json(req.user.actions);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'get',
    data: {}
  });
});

/**
 * @api {get} /user/action/suggested Get list of suggested user actions
 * @apiGroup User Action
 * @apiDescription Returns top three most recent actions that the user has not tried
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *   {
 *     "__v": 0,
 *     "_id": "555f0163688305b57c7cef6c",
 *     "description": "Disabling standby can save up to 10% in total electricity costs.",
 *     "effort": 2,
 *     "impact": 2,
 *     "name": "Disable standby on your devices",
 *     "ratings": []
 *   },
 *   {
 *     ...
 *   }
 * ]
 *
 * @apiVersion 1.0.0
 */
router.get('/suggested', auth.authenticate(), function(req, res) {
  Action.getSuggested(req.user.actions, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'getSuggested',
    data: {}
  });
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
  User.startAction(req.user, req.params.actionId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'start',
    data: req.params
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
  User.cancelAction(req.user, req.params.actionId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'cancel',
    data: req.params
  });
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
  User.completeAction(req.user, req.params.actionId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'complete',
    data: req.params
  });
});

module.exports = router;
