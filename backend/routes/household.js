'use strict';

var express = require('express');
var util = require('util');
var router = express.Router();
var auth = require('../middleware/auth');
var Household = require('../models').households;
var Log = require('../models').logs;

/**
 * @api {post} /household Create new household
 * @apiGroup Household
 *
 * @apiParam {String} apartmentId Energy meter id of the household
 * @apiParam {String} address Household address
 * @apiParam {json}   members Member ids and names in the household
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d \
 *  '{
 *    "apartmentId": "XYZ",
 *    "appliancesList": [
 *       {
 *       "appliance": "Washing Machine",
 *       "quantity": 2
 *       },
 *       {
 *        "appliance": "Heater",
 *        "quantity": 4
 *       }
 *    ],
 *    "address": "Konemiehentie 2, Espoo, 02150",
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
 *  http://localhost:3000/api/household
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 0,
 *     "_id": "555f0163688305b57c7cef6c",
 *     "apartmentId": "XYZ",
 *     "appliancesList': [
 *       {
 *         "appliance":"Washing Machine",
 *         "quanity":2
 *       },
 *       {
 *         "appliance":"Heater",
 *         "quanity":4
 *       }
 *     ],
 *     "address": "Konemiehentie 2, Otaniemi, Espoo, 02150",
 *      "members": [
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
 *     ],
 *     "energyVal": 0
 *   }
 */
router.post('/', auth.authenticate(), function(req, res) {
  var household = req.body;
  household.ownerId = req.user._id;
  Household.create(household, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Household',
    type: 'create',
    data: household
  });
});

/**
 * @api {post} /household/invite/:userId Invite a user to your household
 * @apiGroup Household
 * 
 * @apiParam {String} id MongoId of an user
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \ 
 *  http://localhost:3000/api/household/invite/555f0163688305b57c7cef6c
 * 
 */
router.post('/invite/:userId', auth.authenticate(), function(req, res) {
  req.checkParams('userId', 'Invalid user id').isMongoId();
  Household.invite(req.user._id, req.params.userId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Household',
    type: 'invite',
    data: req.params.userId
  });
});



/**
 * @api {put} /household/invite/:id Accept or reject a household invite
 * @apiGroup Household
 * 
 * @apiParam {String} id MongoId of the household (that sent the invitation)
 * @apiParam {Boolean} accepted TRUE if the received invitation is accepted, FALSE otherwise
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "accepted": "true",
 *  }' \
 *  http://localhost:3000/api/household/555f0163688305b57c7cef6c
 * 
 */
router.put('/invite/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();
  req.checkQuery('accepted', 'Accepted must be true or false').isBoolean();

  //console.log("req.params: "+JSON.stringify(req.params, null, 4));
  //console.log("req.query: "+JSON.stringify(req.query, null, 4));

  Household.handleInvite(req.params.id, req.user._id, req.query.accepted, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Household',
    type: 'handle invite',
    data: req.params
  });
});


/**
 * @api {get} /household/:id Fetch a household by id
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of household
 * @apiExample {curl} Example usage:
 *    curl -i http://localhost:3000/api/household/555ecb997aa6360e40f26451
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "__v": 8,
 *     "_id": "555ef84b2fd41ffc6e078a34",
 *     "apartmentId": XYZ,
 *     "appliancesList': [
 *       {
 *         "appliance":"Washing Machine",
 *         "quanity":2
 *       },
 *       {
 *         "appliance":"Heater",
 *         "quanity":4
 *       }
 *     ],
 *     "address": "Konemiehentie 2, Otaniemi, Espoo 02150",
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

router.get('/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.get(req.params.id, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'get',
      data: req.params
    });
  }
});

/**
 * @api {delete} /household/:id Delete a Household by id
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of household
 * @apiExample {curl} Example usage:
 *    curl -i -X DELETE http://localhost:3000/api/household/555ecb997aa6360e40f26451
 *
 * @apiSuccess {Integer} n Number of deleted household (0 or 1)
 * @apiSuccess {Integer} ok Mongoose internals
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "n": 0,
 *     "ok": 1
 *   }
 */
router.delete('/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.delete(req.params.id, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'delete',
      data: req.params
    });
  }
});

/**
 * @api {put} /household/:id Update household profile
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of household
 * @apiParam {Object} [address] Adress Object of household
 * @apiParam {Object} [houseType] housetyp of household
 * 
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
 *  '{
 *    "Address": "Konemiehentie 2, Otaniemi, Espoo, 02150"
 *  }' \
 *  http://localhost:3000/api/household/555ef84b2fd41ffef6e078a34
 */
router.put('/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    
    //Household.updateAddress(req.body, res.successRes);

    Household.update(req.params.id, req.body, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'update ' + req.params.id,
      data: req.body 
    });
  }
});

/**
 * @api {put} /household/add/:id Add appliance to household
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of household
 * @apiParam {Array} List of appliances in the household
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
 *  '{
 *    "appliance": "1 Oven 800W"
 *  }' \
 *  http://localhost:3000/api/household/add/555ef84b2fd41ffef6e078a34
 */
router.put('/add/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.addAppliance(req.params.id, req.body.appliance, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'addAppliance' + req.params.id,
      data: req.body.appliance
    });
  }
});

/**
 * @api {put} /household/remove/:id Remove appliance from household
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of action
 * @apiParam {Array} List of appliances in the household
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X PUT \
 *  -H "Authorization: Bearer 615ea82f7fec0ffaee5..." \
 *  -H "Content-Type: application/json" -d \
 *  '{
 *    "appliance": "1 Oven 800W"
 *  }' \
 *  http://localhost:3000/api/household/remove/555ef84b2fd41ffef6e078a34
 */
router.put('/remove/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.removeAppliance(req.params.id, req.body.appliance, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'removeAppliance' + req.params.id,
      data: req.body.appliance
    });
  }
});

/**
 * @api {put} /household/addmember/:id Add member to household
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of household
 * @apiParam {Array} List of members in the household
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
 *  http://localhost:3000/api/household/addmember/555ef84b2fd41ffef6e078a34
 */
router.put('/addmember/:id', auth.authenticate(), function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.addmember(req.body, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'addMember',
      data: req.body
    });
  }
});

/**
 * @api {put} /household/removemember/:householdId/:userId Remove a member from household
 * @apiGroup Household
 *
 * @apiParam {String} householdId MongoId of the household
 * @apiParam {String} userId MongoId of the user (a member of the household)
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
 *  http://localhost:3000/api/household/removemember/555ef84b2fd41ffef6e078a34
 */
router.put('/removemember/:householdId/:userId', auth.authenticate(), function(req, res) {
  req.checkParams('householdId', 'Invalid household id').isMongoId(); 

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.removeMember(req.params.householdId, req.params.userId, res.successRes);

    Log.create({
      userId: req.user._id,
      category: 'Household',
      type: 'removeMember',
      data: req.params
    });
  }
});

/**
 * @api {post} /household/connectUsagePoint Connect Household to a usagepoint
 * @apiGroup Household
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \
 *  '{
 *    "apartmentId": "UsagePoint apartmentId",
 *    "familyId": "family secret"
 *  }' \
 *  http://localhost:3000/api/household/connectUsagePoint
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *  "_id": "55d46b3c39659b8018435238",
 *  "apartmentId": "17",
 *  "energyVal": "0",
 *  "ownerId": "55d2ea529e8773a54c2814fb",
 *  "__v": 0,
 *  "_usagePoint": "55d2ef2f739304394f9f0796",
 *  "pendingInvites": [],
 *  "members": [],
 *  "familyComposition": {
 *      "NumKids": 0,
 *      "NumAdults": 0
 *  },
 *  "appliancesList": [
 *      {
 *          "appliance": "Washing Machine",
 *          "quantity": 2,
 *          "_id": "55d46b3c39659b801843523a"
 *      },
 *      {
 *          "appliance": "Heater",
 *          "quantity": 4,
 *          "_id": "55d46b3c39659b8018435239"
 *      }
 *  ],
 *  "address": "Konemiehentie 2, Espoo, 02150",
 *  "connected": true
 *}
 */
router.post('/connectUsagePoint', auth.authenticate(), function(req, res) {
  var usagepoint = req.body;
  usagepoint.userId = req.user._id;
  Household.connectUsagePoint(usagepoint, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Household',
    type: 'connectUsagePoint',
    data: usagepoint
  });
});

module.exports = router;
