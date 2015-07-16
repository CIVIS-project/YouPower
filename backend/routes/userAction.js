'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var router = express.Router();
var User = require('../models').users;
var Action = require('../models').actions;
var Log = require('../models').logs;

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
 * @api {post} /user/action/state/:actionId Change state for user action
 * @apiGroup User Action
 * @apiDescription Used to start/stop actions for a user.
 *
 * @apiParam {String} actionId Action's MongoId
 * @apiParam {String} state Can be one of: 'pending', 'inProgress', 'alreadyDoing',
 * 'done', 'canceled', 'na'.
 * @apiParam {Date} postponed Must be provided if state is 'pending'. Specifies
 * at which time the user will be reminded of the action again.
 *
 * @apiVersion 1.0.0
 */
router.post('/state/:actionId', auth.authenticate(), function(req, res) {
  User.setActionState(req.user, req.params.actionId,
      req.params.state, req.params.postponed, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'User Action',
    type: 'update',
    data: req.params
  });
});

module.exports = router;
