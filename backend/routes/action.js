'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var util = require('util');
var router = express.Router();
var Action = require('../models').actions;
var ActionComment = require('../models').actionComments;

/**
 * @api {post} /action/:actionId/comment Create new action comment
 * @apiGroup Action Comments
 *
 * @apiParam {String} actionId ID of action being commented
 * @apiParam {String} comment Text contents of comment
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "comment": "This is an amazing and easy to perform action!"
 *  }' \
 *  http://localhost:3000/api/action/555f0163688305b57c7cef6c/comment
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "actionId": "555f0163688305b57c7cef6c",
 *     "name": "Test User",
 *     "email": "testuser1@test.com",
 *     "comment": "This is an amazing and easy to perform action!",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "_id": "555f0163688305b57c7cef6d",
 *   }
 */
router.post('/:actionId/comment', auth.authenticate(), function(req, res) {
  ActionComment.create(req.params.actionId, req.user, req.body.comment, res.successRes);
});

/**
 * @api {get} /action/:actionId/comments Get a list of action comments
 * @apiGroup Action Comments
 *
 * @apiParam {String} actionId ID of action whose comments are requested
 * @apiParam {Integer} [limit=10] Maximum number of results returned
 * @apiParam {Integer} [skip=0] Number of results skipped
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "limit": "50",
 *    "skip": "0"
 *  }' \
 *  http://localhost:3000/api/action/555f0163688305b57c7cef6c/comments
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *   {
 *     "_id": "555f0163688305b57c7cef6d",
 *     "actionId": "555f0163688305b57c7cef6c",
 *     "name": "Test User",
 *     "email": "testuser1@test.com",
 *     "comment": "This is an amazing and easy to perform action!",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "__v": 0,
 *   },
 *   ...
 * ]
 */
router.get('/:actionId/comments', auth.authenticate(), function(req, res) {
  ActionComment.get(req.params.actionId, req.body.limit || 10, req.body.skip || 0, res.successRes);
});

/**
 * @api {delete} /action/:actionId/comment/:commentId Delete a comment
 * @apiGroup Action Comments
 *
 * @apiParam {String} actionId ID of action whose comment will be deleted
 * @apiParam {String} commentId ID of comment to be deleted
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/action/555f0163688305b57c7cef6c/comment/555f0163688305b57c7cef6d
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "ok":1,
 *     "n":1
 *   }
 */
router.delete('/:actionId/comment/:commentId', auth.authenticate(), function(req, res) {
  ActionComment.delete(req.params.actionId, req.params.commentId, res.successRes);
});

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
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
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
router.post('/', auth.authenticate(), function(req, res) {
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
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "rating": 4,
 *    "comment": "This tip is really awesome!"
 *  }' \
 *  http://localhost:3000/api/action/rate/555ef84b2fd41ffc6e078a34
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "_id": "5594dbeadfbb985d0ac150c4",
 *     "name": "Disable standby on your devices",
 *     "description": "Disabling standby can save up to 10% in total electricity costs.",
 *     "__v": 0,
 *     "ratings": {
 *       "5593ccfa9255daa130890164": {
 *         "date": "2015-07-02T06:37:39.845Z",
 *         "comment": "This tip is really awesome!",
 *         "name": "Test User",
 *         "rating": 4
 *       }
 *     },
 *     "effort": 2,
 *     "impact": 2,
 *     "activation": {
 *       "configurable": false
 *     },
 *     "category": "oneshot"
 *   }
 */
router.put('/rate/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid action id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Action.rate(req.params.id, req.user, req.body.rating, req.body.comment, res.successRes);
  }
});

/**
 * @api {get} /action/:id Fetch an action by id
 * @apiGroup Action
 *
 * @apiParam {String} id MongoId of action
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/action/555ecb997aa6360e40f26451
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
router.get('/:id', auth.authenticate(), function(req, res) {
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
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/action/555ecb997aa6360e40f26451
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
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/action
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
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/action/search\?q\=foobar
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
        {'email':         regexpQuery}
      ]
    });

    query.select('profile email');
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
