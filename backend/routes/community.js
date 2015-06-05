'use strict';

var express = require('express');
var util = require('util');
var router = express.Router();
var Community = require('../models/community');

/**
 * @api {post} /community Create new community
 * @apiGroup Community
 *
 * @apiParam {String} name Unique Name of the community
 * @apiParam {Array} challenges Challenges specific to the community
 * @apiParam {Array} actions Actions specific to the community
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "name": "Otaniemi Community",
 *    "challenges": [
 *       {
 *       "id": "555eda2531039c1853352b7f",
 *       "name": "Reduce energy consumption by 10%"
 *       },
 *       {
 *        "id": "455eda2531039c1853335b7f",
 *       "name": "Save for 2 solar panels for the area"
 *       }
 *    ],
 *    "actions": [
 *       {
 *       "id": "345eda2531039c1853352b7f",
 *       "name": "Use the clothes washer/dryer only once per week"
 *       },
 *       {
 *        "id": "7645eda34531039c1853352b7f",
 *       "name": "Turn off lights during the day in Summer"
 *       }
 *    ],
 *    "members": [
 *       {
 *         "_id": "testUser1",
 *         "name": "Jane",
 *       },
 *        {
 *         "_id": "testUser2",
 *         "name": "Jack",
 *       }
 *     ]
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
  Community.create(req.body, function(err, community) {
    res.status(err ? 500 : 200).send(err || community);
  });
});

/**
 * @api {get} /community/:id Fetch a community by id
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of community
 * @apiExample {curl} Example usage:
 *    curl -i http://localhost:3000/api/community/555ecb997aa6360e40f26451
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
    Community.getCommunityInfo(req.params.id, function(err, community) {
      res.status(err ? 500 : 200).send(err || community);
    });
  }
});

/**
 * @api {delete} /household/:id Delete a Community by id
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of Community
 * @apiExample {curl} Example usage:
 *    curl -i -X DELETE http://localhost:3000/api/community/555ecb997aa6360e40f26451
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
    Community.delete(req.params.id, function(err, community) {
      res.status(err ? 500 : 200).send(err || community);
    });
  }
});

/**
 * @api {put} /community/add/:id Add member to Community
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of Community
 * @apiParam {Array} List of members in the Community
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
 *  '{
 *    "_id": "testUser1",
 *    "name": "Jane",
 *   }'
 * '{
 *    "_id": "testUser2",
 *    "name": "Jack",
 *  }' \
 *  http://localhost:3000/api/household/join/555ef84b2fd41ffef6e078a34
 */
router.put('/joincommunity/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.addmember(req.body, function(err, community) {
      res.status(err ? 500 : 200).send(err || community);
    });
  }
});

/**
 * @api {put} /community/leave/:id Remove member from community
 * @apiGroup Community
 *
 * @apiParam {String} id MongoId of action
 * @apiParam {Array} List of members in the community
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
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
router.put('/leavecommunity/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Community.removeMember(req.body, function(err, community) {
      res.status(err ? 500 : 200).send(err || community);
    });
  }
});

module.exports = router;
