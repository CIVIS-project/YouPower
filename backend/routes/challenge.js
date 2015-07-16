'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var util = require('util');
var router = express.Router();
var Challenge = require('../models').challenges;
var ChallengeComment = require('../models').challengeComments;
var Log = require('../models').logs;

/**
 * @api {post} /challenge/:challengeId/comment Create new challenge comment
 * @apiGroup Challenge Comments
 *
 * @apiParam {String} challengeId ID of challenge being commented
 * @apiParam {String} comment Text contents of comment
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "comment": "This is an amazing and easy to perform challenge!"
 *  }' \
 *  http://localhost:3000/api/challenge/555f0163688305b57c7cef6c/comment
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "challengeId": "555f0163688305b57c7cef6c",
 *     "name": "Test User",
 *     "email": "testuser1@test.com",
 *     "comment": "This is an amazing and easy to perform challenge!",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "_id": "555f0163688305b57c7cef6d",
 *   }
 */
router.post('/:challengeId/comment', auth.authenticate(), function(req, res) {
  var challengeComment = req.body;
  challengeComment.actionId = req.params.actionId;
  challengeComment.name = req.user.profile.name;
  challengeComment.email = req.user.email;
  ChallengeComment.create(challengeComment, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Challenge Comments',
    type: 'create',
    data: challengeComment
  });
});

/**
 * @api {get} /challenge/:challengeId/comments Get a list of challenge comments
 * @apiGroup Challenge Comments
 *
 * @apiParam {String} challengeId ID of challenge whose comments are requested
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
 *  http://localhost:3000/api/challenge/555f0163688305b57c7cef6c/comments
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *   {
 *     "_id": "555f0163688305b57c7cef6d",
 *     "challengeId": "555f0163688305b57c7cef6c",
 *     "name": "Test User",
 *     "email": "testuser1@test.com",
 *     "comment": "This is an amazing and easy to perform challenge!",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "__v": 0,
 *   },
 *   ...
 * ]
 */
router.get('/:challengeId/comments', auth.authenticate(), function(req, res) {
  ChallengeComment.get(
      req.params.challengeId, req.body.limit || 10, req.body.skip || 0, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Challenge Comments',
    type: 'get',
    data: {
      challengeId: req.params.challengeId,
      limit: req.body.limit,
      skip: req.body.skip
    }
  });
});

/**
 * @api {delete} /challenge/:challengeId/comment/:commentId Delete a comment
 * @apiGroup Challenge Comments
 *
 * @apiParam {String} challengeId ID of challenge whose comment will be deleted
 * @apiParam {String} commentId ID of comment to be deleted
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/challenge/555f0163688305b57c7cef6c/comment/555f0163688305b57c7cef6d
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "ok":1,
 *     "n":1
 *   }
 */
router.delete('/:challengeId/comment/:commentId', auth.authenticate(), function(req, res) {
  ChallengeComment.delete(req.params.challengeId, req.params.commentId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Challenge Comments',
    type: 'delete',
    data: req.params
  });
});

/**
 * @api {post} /challenge Create new challenge
 * @apiGroup Challenge
 *
 * @apiParam {String} name Challenge name
 * @apiParam {String} description Challenge description
 * @apiParam {Array} actions List of action IDs
 *
 * @apiParam {ratings} Rating for a challenge, (1 [least] - 5 [most]), default 0

 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "Test challenge",
 *    "description": "Test description",
 *    "actions": ["555eda2531039c1853352b7f", "555eda2531039c1853352b7c"]
 *  }' \
 *  http://localhost:3000/api/challenge
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "name": "Test challenge",
 *     "description": "Test description",
 *     "_id": "5593ea61caed58c705a25278",
 *     "actions": [
 *       "555eda2531039c1853352b7f",
 *       "555eda2531039c1853352b7c"
 *     ]
 *   }
 */
router.post('/', auth.authenticate(), function(req, res) {
  Challenge.create(req.body, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Challenge',
    type: 'create',
    data: req.body
  });
});

/**
 * @api {put} /challenge/rate/:id Create/update user's rating of challenge
 * @apiGroup Challenge
 *
 * @apiParam {String} id MongoId of challenge
 * @apiParam {Number} rating Rating of challenge (1 [least] - 5 [most])
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "rating": 4,
 *    "comment": "This challenge is really awesome!"
 *  }' \
 *  http://localhost:3000/api/challenge/rate/555ef84b2fd41ffc6e078a34
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "_id": "5593ea61caed58c705a25278",
 *     "name": "Test challenge",
 *     "description": "Test description",
 *     "__v": 0,
 *     "ratings": {
 *       "5593ccfa9255daa130890164": {
 *         "rating": 4,
 *         "name": "Test User",
 *         "comment": "This challenge is really awesome!",
 *         "date": "2015-07-01T13:39:51.678Z"
 *       }
 *     },
 *     "actions": [
 *       "555eda2531039c1853352b7c",
 *       "555eda2531039c1853352b7f"
 *     ],
 *     "avgRating": 4,
 *     "numRatings": 1
 *   }
 */
router.put('/rate/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid challenge id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Challenge.rate(req.params.id, req.user, req.body.rating, req.body.comment, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Challenge',
      type: 'rate',
      data: {
        challengeId: req.params.id,
        rating: req.body.rating,
        comment: req.body.comment
      }
    });
  }
});

/**
 * @api {get} /challenge/:id Fetch a challenge by id
 * @apiGroup Challenge
 *
 * @apiParam {String} id MongoId of challenge
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/challenge/555ecb997aa6360e40f26451
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "_id": "5593ea61caed58c705a25278",
 *     "name": "Test challenge",
 *     "description": "Test description",
 *     "__v": 0,
 *     "ratings": {
 *       "5593ccfa9255daa130890164": {
 *         "rating": 4,
 *         "name": "Test User",
 *         "comment": "This challenge is awesome!",
 *         "date": "2015-07-01T13:39:51.678Z"
 *       }
 *     },
 *     "actions": [
 *       "555eda2531039c1853352b7c",
 *       "555eda2531039c1853352b7f"
 *     ],
 *     "avgRating": 4,
 *     "numRatings": 1
 *   }
 */
router.get('/:id', function(req, res) {
  req.checkParams('id', 'Invalid challenge id').isMongoId();
  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Challenge.get(req.params.id, function(err, challenge) {
      res.status(err ? 500 : 200).send(err || challenge);
    });

    Log.create({
      userId: req.user._id,
      category: 'Challenge',
      type: 'get',
      data: {
        challengeId: req.params.id
      }
    });
  }
});

/**
 * @api {delete} /challenge/:id Delete a challenge by id
 * @apiGroup Challenge
 *
 * @apiParam {String} id MongoId of challenge
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/challenge/555ecb997aa6360e40f26451
 *
 * @apiSuccess {Integer} n Number of deleted challenges (0 or 1)
 * @apiSuccess {Integer} ok Mongoose internals
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "n": 0,
 *     "ok": 1
 *   }
 */
router.delete('/:id', function(req, res) {
  req.checkParams('id', 'Invalid challenge id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Challenge.delete(req.params.id, function(err, challenge) {
      res.status(err ? 500 : 200).send(err || challenge);
    });

    Log.create({
      userId: req.user._id,
      category: 'Challenge',
      type: 'delete',
      data: {
        challengeId: req.params.id
      }
    });
  }
});

/**
 * @api {get} /challenge Get a list of challenges
 * @apiGroup Challenge
 *
 * @apiParam {Integer} [limit=50] Maximum number of results returned
 * @apiParam {Integer} [skip=0] Number of results skipped
 * @apiParam {Boolean} [includeRatings=false] Include individual user ratings of challenge
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/challenge
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

  Challenge.all(req.body.limit || 50, req.body.skip, req.body.includeRatings, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Challenge',
    type: 'all',
    data: req.body
  });
});

/**
 * @api {get} /challenge/search Search for Challenges by name (TODO: implement me)
 * @apiGroup Challenge
 *
 * @apiParam {String} q Search query
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/challenge/search\?q\=foobar
 */
router.get('/search', function(req, res) {
  req.checkQuery('q', 'Invalid query parameter').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Challenge.search(req.query.q, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Challenge',
      type: 'search',
      data: req.query
    });
  }
});

module.exports = router;
