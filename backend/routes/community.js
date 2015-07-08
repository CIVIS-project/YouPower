'use strict';

var express = require('express');
var util = require('util');
var auth = require('../middleware/auth');
var router = express.Router();
var Community = require('../models').communities;
var CommunityComment = require('../models').communityComments;
var fs = require('fs');

/**
 * @api {post} /community/:communityId/comment Create new community comment
 * @apiGroup Community Comments
 *
 * @apiParam {String} communityId ID of community being commented
 * @apiParam {String} comment Text contents of comment
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "comment": "This is a fun community!"
 *  }' \
 *  http://localhost:3000/api/community/555f0163688305b57c7cef6c/comment
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "communityId": "555f0163688305b57c7cef6c",
 *     "name": "Test User",
 *     "email": "testuser1@test.com",
 *     "comment": "This is a fun community!",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "_id": "555f0163688305b57c7cef6d",
 *   }
 */
router.post('/:communityId/comment', auth.authenticate(), function(req, res) {
  var communityComment = req.body;
  communityComment.actionId = req.params.actionId;
  communityComment.name = req.user.profile.name;
  communityComment.email = req.user.email;
  CommunityComment.create(communityComment, res.successRes);
});

/**
 * @api {get} /community/:communityId/comments Get a list of community comments
 * @apiGroup Community Comments
 *
 * @apiParam {String} communityId ID of community whose comments are requested
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
 *  http://localhost:3000/api/community/555f0163688305b57c7cef6c/comments
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *   {
 *     "_id": "555f0163688305b57c7cef6d",
 *     "communityId": "555f0163688305b57c7cef6c",
 *     "name": "Test User",
 *     "email": "testuser1@test.com",
 *     "comment": "This is a fun community!",
 *     "date": "2015-07-01T12:04:33.599Z",
 *     "__v": 0,
 *   },
 *   ...
 * ]
 */
router.get('/:communityId/comments', auth.authenticate(), function(req, res) {
  CommunityComment.get(
      req.params.communityId, req.body.limit || 10, req.body.skip || 0, res.successRes);
});

/**
 * @api {delete} /community/:communityId/comment/:commentId Delete a comment
 * @apiGroup Community Comments
 *
 * @apiParam {String} communityId ID of community whose comment will be deleted
 * @apiParam {String} commentId ID of comment to be deleted
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/community/555f0163688305b57c7cef6c/comment/555f0163688305b57c7cef6d
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "ok":1,
 *     "n":1
 *   }
 */
router.delete('/:communityId/comment/:commentId', auth.authenticate(), function(req, res) {
  CommunityComment.delete(req.params.communityId, req.params.commentId, res.successRes);
});

/**
 * @api {post} /community Create new community
 * @apiGroup Community
 *
 * @apiParam {String} name Unique Name of the community
 * @apiParam {Array} challenges Challenges specific to the community
 * @apiParam {Array} actions Actions specific to the community
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "name": "Otaniemi Community",
 *    "challenges": [
 *      {
 *        "id": "555eda2531039c1853352b7f",
 *        "name": "Reduce energy consumption by 10%"
 *      },
 *      {
 *        "id": "455eda2531039c1853335b7f",
 *        "name": "Save for 2 solar panels for the area"
 *      }
 *    ],
 *    "actions": [
 *      {
 *        "id": "345eda2531039c1853352b7f",
 *        "name": "Use the clothes washer/dryer only once per week"
 *      },
 *      {
 *        "id": "7645eda34531039c1853352b7f",
 *        "name": "Turn off lights during the day in Summer"
 *      }
 *    ],
 *    "members": [
 *      {
 *        "_id": "testUser1",
 *        "name": "Jane"
 *      },
 *      {
 *        "_id": "testUser2",
 *        "name": "Jack"
 *      }
 *    ]
 *  }' \
 *  http://localhost:3000/api/community
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "_id": "555f0163688305b57c7cef6c",
 *     "name": "Otaniemi Community",
 *     "challenges": [
 *       {
 *         "id": "555eda2531039c1853352b7f",
 *         "name": "Reduce energy consumption by 10%"
 *       },
 *       {
 *         "id": "455eda2531039c1853335b7f",
 *         "name": "Save for 2 solar panels for the area"
 *       }
 *     ],
 *     "actions": [
 *       {
 *         "id": "345eda2531039c1853352b7f",
 *         "name": "Use the clothes washer/dryer only once per week"
 *       },
 *       {
 *         "id": "7645eda34531039c1853352b7f",
 *         "name": "Turn off lights during the day in Summer"
 *       }
 *     ],
 *     "members": [
 *       "User": {
 *         "_id": "testUser1",
 *         "name": "Jane"
 *       },
 *       "User": {
 *         "_id": "testUser2",
 *         "name": "Jack"
 *       }
 *     ],
 *     "date": "2015-07-01T12:04:33.599Z"
 *   }
 */
router.post('/', auth.authenticate(), function(req, res) {
  Community.create(req.body, res.successRes);
});

/**
 * @api {get} /community/:id Fetch a community by id
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of community
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/community/555ecb997aa6360e40f26451
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *      "name": "Otaniemi Community",
 *     "challenges": [
 *       {
 *       "id": "555eda2531039c1853352b7f",
 *       "name": "Reduce energy consumption by 10%"
 *       },
 *       {
 *        "id": "455eda2531039c1853335b7f",
 *       "name": "Save for 2 solar panels for the area"
 *       }
 *    ],
 *     "actions": [
 *       {
 *       "id": "345eda2531039c1853352b7f",
 *       "name": "Use the clothes washer/dryer only once per week"
 *       },
 *       {
 *        "id": "7645eda34531039c1853352b7f",
 *       "name": "Turn off lights during the day in Summer"
 *       }
 *    ],
 *     "members": [
 *       {
 *         "_id": "testUser1",
 *         "name": "Jane",
 *       },
 *        {
 *         "_id": "testUser2",
 *         "name": "Jack",
 *       },
 *       ...
 *     ],
 *     "date": "2015-07-01T12:04:33.599Z"
 *   }
 */

router.get('/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.getCommunityInfo(req.params.id, res.successRes);
  }
});

/**
 * @api {delete} /household/:id Delete a Community by id
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of Community
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X DELETE -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/community/555ecb997aa6360e40f26451
 *
 * @apiSuccess {Integer} n Number of deleted communities (0 or 1)
 * @apiSuccess {Integer} ok Mongoose internals
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "n": 0,
 *     "ok": 1
 *   }
 */
router.delete('/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.delete(req.params.id, res.successRes);
  }
});

/**
 * @api {put} /community/join/:id Join community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of community
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/community/join/555ef84b2fd41ffef6e078a34
 */
router.put('/join/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.addMember(req.params.id, req.user._id, res.successRes);
  }
});

/**
 * @api {put} /community/leave/:id Leave community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of community
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Authorization: Bearer $API_TOKEN" -d \
 *  http://localhost:3000/api/community/leave/555ef84b2fd41ffef6e078a34
 */
router.put('/leave/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.removeMember(req.params.id, req.user._id, res.successRes);
  }
});

// TODO: verify that this one works
/**
 * @api {get} /community/top/:id Display top actions from community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of action
 * @apiParam {Integer} [limit=10] Count limit
 * @apiParam {Array} actions List of top actions in the community, actions with high rating
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/community/top/315ea82f7fec0ffaee5
 */
router.get('/top/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.topActions(req.params.id, req.body.limit, res.successRes);
  }
});

/**
 * @api {post} /community/communityPicture Update your Community picture
 * @apiGroup Community
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/profile
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: image/png" -H "Authorization: Bearer $API_TOKEN" \
 *  --data-binary @/path/to/picture.png \
 *  http://localhost:3000/api/community/communityPicture/:id
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "status": "ok"
 * }
 */
router.post('/communityPicture/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();
  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    var picPath = process.env.HOME + '/.youpower/communityPicture/' + req.params.id + '.png';
    var stream = fs.createWriteStream(picPath);
    req.pipe(stream);
    stream.on('close', function() {
      res.successRes(null, {msg: 'success!'});
    });
    stream.on('error', function(err) {
      res.successRes(err);
    });
  }
});

module.exports = router;
