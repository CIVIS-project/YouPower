'use strict';

var auth = require('../middleware/auth');
var express = require('express');
var router = express.Router();
var User = require('../models').users;

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
  User.startAction(req.user, req.params.actionId, res.successRes);
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
});

module.exports = router;
