'use strict';

var express = require('express');
var util = require('util');
var router = express.Router();
var Action = require('../models/action');

/**
 * @api {post} /action Create new action
 * @apiGroup Action
 *
 * @apiParam {String} name Action name
 * @apiParam {String} description Action description
 * @apiParam {Number} [impact=10] Initial impact estimation of the action
 * (1 [least] - 100 [most])
 * @apiParam {Number} [effort=3] Initial effort estimation of the action
 * (1 [least] - 5 [most])
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "name": "Disable standby on your devices",
 *    "description": "Disabling standby can save up to 10% in total electricity costs.",
 *    "impact": 30,
 *    "effort": 2
 *  }' \
 *  http://localhost:3000/api/action
 */
router.post('/', function(req, res) {
  Action.create(req.body.name, req.body.impact, req.body.effort, function(err, action) {
    res.status(err ? 500 : 200).send(err || action);
  });
});

/**
 * @api {get} /action/:id Fetch an action by id
 * @apiGroup Action
 *
 * @apiParam {String} id MongoId of action
 * @apiExample {curl} Example usage:
 *    curl -i http://localhost:3000/api/action/555ecb997aa6360e40f26451
 */
router.get('/:id', function(req, res) {
  req.checkParams('id', 'Invalid action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Action.get(req.params.id, function(err, action) {
      res.status(err ? 500 : 200).send(err || action);
    });
  }
});

/**
 * @api {delete} /action/:id Fetch an action by id
 * @apiGroup Action
 *
 * @apiParam {String} id MongoId of action
 * @apiExample {curl} Example usage:
 *    curl -i -X DELETE http://localhost:3000/api/action/555ecb997aa6360e40f26451
 */
router.delete('/:id', function(req, res) {
  req.checkParams('id', 'Invalid action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Action.delete(req.params.id, function(err, action) {
      res.status(err ? 500 : 200).send(err || action);
    });
  }
});

/**
 * @api {get} /action Get a list of actions
 * @apiGroup Action
 *
 * @apiParam {Integer} [limit=50] Maximum number of results returned
 * @apiParam {Integer} [skip=0] Number of results skipped
 */
router.get('/', function(req, res) {
  req.checkBody('limit').optional().isInt();
  req.checkBody('skip').optional().isInt();

  Action.all(req.body.limit, req.body.skip, function(err, action) {
    res.status(err ? 500 : 200).send(err || action);
  });
});

module.exports = router;
