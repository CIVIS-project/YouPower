'use strict';

var express = require('express');
var util = require('util');
var router = express.Router();
var Household = require('../models').households;

/**
 * @api {post} /household Create new household
 * @apiGroup Household
 *
 * @apiParam {String} apartmentId Energy meter id of the household
 * @apiParam {String} address Household address
 * @apiParam {json}   members Member ids and names in the household
 *
 * @apiExample {curl} Example usage:
 *  curl -i -X POST -H "Content-Type: application/json" -d \
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
 *     ]
 *   }
 */
router.post('/', function(req, res) {
  Household.create(req.body, res.successRes);
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

router.get('/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.getApartmentInfo(req.params.id, res.successRes);
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
router.delete('/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.delete(req.params.id, res.successRes);
  }
});

/**
 * @api {put} /household/:id Update address of household
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of household
 * @apiParam {Address} Address String of household
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
router.put('/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.updateAddress(req.body, res.successRes);
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
 *    "appliance": "Oven",
*     "quantity":1
 *  }' \
 *  http://localhost:3000/api/household/add/555ef84b2fd41ffef6e078a34
 */
router.put('/add/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.addAppliance(req.body, res.successRes);
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
 *    "appliance": "Oven",
*     "quantity":1
 *  }' \
 *  http://localhost:3000/api/household/remove/555ef84b2fd41ffef6e078a34
 */
router.put('/remove/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.removeAppliance(req.body, res.successRes);
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
router.put('/addmember/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.addmember(req.body, res.successRes);
  }
});

/**
 * @api {put} /household/removemember/:id Remove member from household
 * @apiGroup Household
 *
 * @apiParam {String} id MongoId of action
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
 *  http://localhost:3000/api/household/removemember/555ef84b2fd41ffef6e078a34
 */
router.put('/removemember/:id', function(req, res) {
  req.checkParams('id', 'Invalid household id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Household.removeMember(req.body, res.successRes);
  }
});

module.exports = router;
