'use strict';

var express = require('express');
var auth = require('../middleware/auth');
var router = express.Router();
var Feedback = require('../models').feedback;

/**
 * @api {post} /feedback Send feedback
 * @apiGroup Feedback
 *
 * @apiParam {Boolean} [anonymous=false] false = include user's name & email
 * @apiParam {Object} comment Contents of feedback (free-form JSON)
 * @apiParam {String} kind What kind of feedback is this, must be one of
 * "general, actionCompleted, actionCanceled"
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "anonymous": false,
 *    "kind": "actionCompleted",
 *    "comment": {
 *      "text": "Thank you for this app!"
 *    }
 *  }' \
 *  http://localhost:3000/api/feedback
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *    "__v": 0,
 *    "comment": "Thank you for this app!",
 *    "date": "2015-07-02T12:59:58.932Z",
 *    "_id": "559535ced51d8717277cd816",
 *    "email": "testuser1@test.com",
 *    "kind": "actionCompleted",
 *    "name": "My Name"
 *  }
 */
router.post('/', auth.authenticate(), function(req, res) {
  Feedback.create({
    name: req.body.anonymous ? null : req.user.profile.name,
    email: req.body.anonymous ? null : req.user.email,
    comment: req.body.comment
  }, res.successRes);
});

/**
 * @api {get} /feedback Get feedback comments
 * @apiGroup Feedback
 *
 * @apiParam {Integer} [limit=100] Maximum number of results returned
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
 *  http://localhost:3000/api/feedback
 *
 * @apiSuccessExample {json} Success-Response:
 *  [
 *    {
 *      "__v": 0,
 *      "comment": "Thank you for this app!",
 *      "date": "2015-07-02T12:59:58.932Z",
 *      "_id": "559535ced51d8717277cd816",
 *      "email": "testuser1@test.com",
 *      "name": "My Name"
 *    },
 *    {
 *      "__v": 0,
 *      "comment": "This is a nice app!",
 *      "date": "2015-07-02T12:59:58.932Z",
 *      "_id": "559535ced51d8717277cd816",
 *      "email": null,
 *      "name": null
 *    },
 *    ...
 *  ]
 */
router.get('/', auth.authenticate(), function(req, res) {
  Feedback.all(req.body.limit || 100, req.body.skip || 0, res.successRes);
});

module.exports = router;
