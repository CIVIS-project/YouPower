'use strict';

var express = require('express');
var util = require('util');
var router = express.Router();
var Community = require('../models').communities;

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
 *        "User":
 *         {
 *          "_id": "testUser1",
 *          "name": "Jane",
 *        },
 *       "User" :
 *        {
 *         "_id": "testUser2",
 *         "name": "Jack",
 *       }
 *     ]
 *   }
 */
router.post('/', function(req, res) {
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
 *     ]
 *   }
 */

router.get('/:id', function(req, res) {
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
router.delete('/:id', function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.delete(req.params.id, res.successRes);
  }
});

/**
 * @api {put} /community/join/:id Add member to Community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of Community
 * @apiParam {Array} members List of members in the Community
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "_id": "testUser1",
 *    "name": "Jack",
 *  }' \
 *  http://localhost:3000/api/community/join/555ef84b2fd41ffef6e078a34
 */
router.put('/join/:id', function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.addmember(req.body, res.successRes);
  }
});

/**
 * @api {put} /community/leave/:id Remove member from community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of action
 * @apiParam {Array} members List of members in the community
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "_id": "testUser1",
 *    "name": "Jane",
 *   }'
 * '{
 *    "_id": "testUser2",
 *    "name": "Jack",
 *  }' \
 *  http://localhost:3000/api/community/leave/555ef84b2fd41ffef6e078a34
 */
router.put('/leave/:id', function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.removeMember(req.body, res.successRes);
  }
});

/**
 * @api {put} /community/top/:id Display top actions from community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of action
 * @apiParam {Array} actions List of top actions in the community, actions with high rating
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "_id": "315ea82f7fec0ffaee5",
 *   }' \
 *  http://localhost:3000/api/community/top/315ea82f7fec0ffaee5
 */
router.get('/top/:id', function(req, res) {
  req.checkParams('id', 'Invalid Community id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.topActions(req.id, res.successRes);
  }
});

module.exports = router;
