'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var util = require('util');
var router = express.Router();
var Challenge = require('../models/challenge');

/**
 * @api {post} /challenge Create new challenge
 * @apiGroup Challenge
 *
 * @apiParam {String} name Challenge name
 * @apiParam {String} description Challenge description
 * @apiParam {Array} List of action IDs, eg:
 *
 * ["555eda2531039c1853352b7f", "555eda2531039c1853352b7f"]
 * @apiParam {ratings} Rating for a challenge, (1 [least] - 5 [most]), default 0

 *  http://localhost:3000/api/challenge
 */
router.post('/', function(req, res) {
  Challenge.create(req.body, res.successRes);
});

/**
 * @api {put} /challenge/rate/:id Create/update user's rating of challenge
 * @apiGroup Challenge
 *
 * @apiParam {String} id MongoId of challenge
 * @apiParam {Number} rating Rating of challenge (1 [least] - 5 [most])
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
 *  '{
 *    "rating": 4,
 *    "comment": "This challenge is awesome!"
 *  }' \
 *  http://localhost:3000/api/challenge/rate/555ef84b2fd41ffc6e078a34
 */
router.put('/rate/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid challenge id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Challenge.rate(req.params.id, req.user.email, req.body.rating, req.body.comment,
        function(err, challenge) {
      res.status(err ? 500 : 200).send(err || challenge);
    });
  }
});

/**
 * @api {get} /challenge/:id Fetch a challenge by id
 * @apiGroup Challenge
 *
 * @apiParam {String} id MongoId of challenge
 * @apiExample {curl} Example usage:
 *    curl -i http://localhost:3000/api/challenge/555ecb997aa6360e40f26451
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
  }
});

/**
 * @api {delete} /challenge/:id Delete a challenge by id
 * @apiGroup Challenge
 *
 * @apiParam {String} id MongoId of challenge
 * @apiExample {curl} Example usage:
 *    curl -i -X DELETE http://localhost:3000/api/challenge/555ecb997aa6360e40f26451
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
 *    curl -i http://localhost:3000/api/challenge
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
  Challenge.all(req.body.limit || 50, req.body.skip, req.body.includeRatings,
    function(err, challenge) {
    res.status(501).send('Not implemented');
    res.status(err ? 500 : 200).send(err || challenge);
  });
});

/**
 * @api {get} /challenge/search Search for Challenges by name
 * @apiGroup Challenge
 *
 * @apiParam {String} q Search query
 *
 * @apiExample {curl} Example usage:
 *  curl -i http://localhost:3000/api/challenge/search\?q\=foobar
 */
router.get('/search', function(req, res) {
  req.checkQuery('q', 'Invalid query parameter').notEmpty();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Challenge.search(req.query.q, function(err, challenge) {
      res.status(err ? 500 : 200).send(err || challenge);
    });
  }
});

module.exports = router;
