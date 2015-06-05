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
 * @apiParam {String} [category=oneshot] Category of action. Can be one of:
 *
 *   - **oneshot**: action only needs to be performed once, then it’s
 *   considered done (eg. disable standby setting on your devices)
 *
 *   - **reminder**: enabling action sets a reminder X days into the future,
 *   when performed once, it’s considered done (eg. perform a weatherization
 *   repair just before winter)
 *
 *   - **continuous**: action is valid for a long period of time, requires the
 *   user to be aware of it all the time (eg. turn lights, appliances etc. off
 *   when not in use)
 *
 *   - **repeating**: like reminders but will also repeat every X days. (eg.
 *   change & clean filters in heating and cooling equipment monthly)
 *
 * @apiParam {json} [activation] Settings for when action is activated:
 *
 * ```json
 * {
 * "repeat": Number,
 * "delay": Number,
 * "configurable": Boolean
 * }
 * ```
 *
 * Where
 *
 * - **repeat**: how often (days) does the action repeat? (default = 0, never)
 *
 * - **delay**: how many days to delay this action with? (default = 0, no delay)
 *
 * - **configurable**: is user allowed to customize **repeat** and **delay** if
 *   they have non-zero defaults. (values of zero always customizeable to allow
 *   postponing an action. default = false)
 *
 * @apiParam {Number} [impact=3] Initial impact estimation of the action
 * (1 [least] - 5 [most])
 * @apiParam {Number} [effort=3] Initial effort estimation of the action
 * (1 [least] - 5 [most])
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "name": "Disable standby on your devices",
 *    "description": "Disabling standby can save up to 10% in total electricity costs.",
 *    "impact": 2,
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
 *     "impact": 2,
 *     "name": "Disable standby on your devices",
 *     "ratings": []
 *   }
 */
router.post('/', function(req, res) {
  Action.create(req.body, res.successRes);
});

/**
 * @api {put} /action/rate/:id Create/update user's rating of action
 * @apiGroup Action
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
    Action.rate(req.params.id, req.user.userId, req.body.rating, req.body.comment, res.successRes);
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
 *     "impact": 2,
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
    Action.get(req.params.id, res.successRes);
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
    Action.delete(req.params.id, res.successRes);
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
 *       "impact": 2,
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

  Action.all(req.body.limit || 50, req.body.skip, req.body.includeRatings, res.successRes);
});

/**
 * @api {get} /action/search Search for actions (TODO: implement me)
 * @apiGroup Action
 *
 * @apiParam {String} q Search query
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://localhost:3000/api/action/search\?q\=foobar
 */
router.get('/search', auth.authenticate(), function(req, res) {
  req.checkQuery('q', 'Invalid query parameter').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    res.status(501).send('Not implemented');
    /*
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
    */
  }
});
module.exports = router;
