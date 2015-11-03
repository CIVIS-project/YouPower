'use strict';

var express = require('express');
var util = require('util');
var router = express.Router();
var Testbed = require('../models').testbeds;
var Log = require('../models').logs;

/**
 * @api {get} /testbed/ Fetch list of available testbeds
 * @apiGroup Testbed
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/testbed/
 *
 * @apiSuccessExample {json} Success-Response:
 *   [{
 *      "_id":"562e2919b15c6e0ebb8ca53f",
 *      "name":"Stockholm - Fårdala",
 *      "__v":0
 *    },{
 *      "_id":"562e2919b15c6e0ebb8ca540",
 *      "name":"Stockholm - Hammarby Sjöstad",
 *      "__v":0
 *    },{
 *      "_id":"562e2919b15c6e0ebb8ca541",
 *      "name":"Trentino - Storo",
 *      "__v":0
 *    },{
 *      "_id":"562e2919b15c6e0ebb8ca542",
 *      "name":"Trentino - San Lorenzo in Banale",
 *      "__v":0
 *    }]
 */
router.get('/', function(req, res) {
  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Testbed.all(res.successRes);

    Log.create({
      category: 'Testbed',
      type: 'get'
    });
  }
});

/**
 * @api {get} /cooperative/:id Fetch a testbed by id
 * @apiGroup Testbed
 *
 * @apiParam {String} id MongoId of cooperative
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/cooperative/55f14ce337d4bef728a861ab
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "_id":"562e2919b15c6e0ebb8ca53f",
 *     "name":"Stockholm - Fårdala",
 *     "__v":0
 *   }
 */
router.get('/:id', function(req, res) {
  req.checkParams('id', 'Invalid cooperative id').isMongoId();

  var err;
  if ((err = req.validationErrors())) {
    res.status(500).send('There have been validation errors: ' + util.inspect(err));
  } else {
    Testbed.get(req.params.id, res.successRes);

    Log.create({
      category: 'Testbed',
      type: 'get',
      data: {
        testbedId: req.params.id
      }
    });
  }
});

module.exports = router;
