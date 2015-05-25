'use strict';

var express = require('express');
var auth = require('../middleware/auth');
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
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "_id": "555f0163688305b57c7cef6c",
 *     "description": "Disabling standby can save up to 10% in total electricity costs.",
 *     "effort": 2,
 *     "impact": 30,
 *     "name": "Disable standby on your devices",
 *     "ratings": []
 *   }
 */
router.post('/', function(req, res) {
  Action.create(req.body.name, req.body.description, req.body.impact, req.body.effort,
      function(err, action) {
    res.status(err ? 500 : 200).send(err || action);
  });
});

/**
 * @api {put} /action/rate/:id Create/update user's rating of action
 * @apiGroup Action
 *
 * @apiUse Authorization
 *
 * @apiParam {String} id MongoId of action
 * @apiParam {Number} rating Rating of action (1 [least] - 5 [most])
 * @apiParam {String} [comment] Comment attached to rating
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
 *  '{
 *    "rating": 4,
 *    "comment": "This tip is awesome!"
 *  }' \
 *  http://localhost:3000/api/action/rate/555ef84b2fd41ffc6e078a34
 */
router.put('/rate/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Action.rate(req.params.id, req.user.userId, req.body.rating, req.body.comment,
        function(err, action) {
      res.status(err ? 500 : 200).send(err || action);
    });
  }
});

/**
 * @api {get} /action/:id Fetch an action by id
 * @apiGroup Action
 *
 * @apiParam {String} id MongoId of action
 * @apiExample {curl} Example usage:
 *    curl -i http://localhost:3000/api/action/555ecb997aa6360e40f26451
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "avgRating": 4.25,
 *     "description": "Disabling standby can save up to 10% in total electricity costs.",
 *     "effort": 3,
 *     "impact": 10,
 *     "name": "Disable standby on your devices",
 *     "numRatings": 4,
 *     "ratings": [
 *       {
 *         "_id": "testUser",
 *         "comment": "This tip is awesome!",
 *         "rating": 4
 *       },
 *       ...
 *     ]
 *   }
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
 * @api {delete} /action/:id Delete an action by id
 * @apiGroup Action
 *
 * @apiParam {String} id MongoId of action
 * @apiExample {curl} Example usage:
 *    curl -i -X DELETE http://localhost:3000/api/action/555ecb997aa6360e40f26451
 *
 * @apiSuccess {Integer} n Number of deleted actions (0 or 1)
 * @apiSuccess {Integer} ok Mongoose internals
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "n": 0,
 *     "ok": 1
 *   }
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
 * @apiParam {Boolean} [includeRatings=false] Include individual user ratings of action
 *
 * @apiExample {curl} Example usage:
 *    curl -i http://localhost:3000/api/action
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *     {
 *       "__v": 8,
 *       "_id": "555ef84b2fd41ffc6e078a34",
 *       "avgRating": 4.25,
 *       "description": "Disabling standby can save up to 10% in total electricity costs.",
 *       "effort": 3,
 *       "impact": 10,
 *       "name": "Disable standby on your devices",
 *       "numRatings": 4
 *     },
 *     ...
 *   ]
 */
router.get('/', function(req, res) {
  req.checkBody('limit').optional().isInt();
  req.checkBody('skip').optional().isInt();

  req.sanitize('includeReviews').toBoolean();

  Action.all(req.body.limit || 50, req.body.skip, req.body.includeRatings, function(err, action) {
    res.status(err ? 500 : 200).send(err || action);
  });
});

module.exports = router;
