'use strict';

var express = require('express');
var router = express.Router();
var Consumption = require('../models').consumption;
var auth = require('../middleware/auth');
var Log = require('../models').logs;

/**
 * @api {get} /consumption Get energy consumption data
 * @apiGroup Consumption
 *
 * @apiParam {String} userId CIVIS backend user ID
 * @apiParam {String} token CIVIS backend user token
 * @apiParam {Date} from Start date string in simplified extended
 * ISO8601 format
 * @apiParam {Date} to End date string in simplified extended
 * ISO8601 format
 * @apiParam {String} res Granularity of the answer. Possible values:
 * quarterly, hourly, daily, weekly, monthly
 *
 * @apiVersion 1.0.0
 */

//curl "http://civis.cloud.reply.eu/Civis/EnergyPlatform.svc/downloadMyData?
//userID=387051&token=688b026c-665f-4994-9139-6b21b13fbeee
//&from=23-Mar-13%207%3A00:00%20PM&to=25-Apr-13%208:30:00%20PM&res=daily"
router.get('/', auth.authenticate(), function(req, res) {
  Consumption.get(req.body, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Consumption Data',
    type: 'get',
    data: req.body
  });
});

/**
 * @api {get} /consumption/appliance/:id Consumption data for a specific appliance
 * @apiGroup Consumption
 *
 * @apiParam {String} id appliance id
 *
 * @apiExample {curl} Example usage
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  http://localhost:3000/api/consumption/appliance/164172718301
 *
 * @apiSuccessExample {[json]} Success-Response:
 *   [
 *    0.1187375511508435,
 *    0.9294693802949041,
 *    0.1715518836863339,
 *    0.10940657090395689,
 *    0.6286844359710813
 *  ]
 */
router.get('/appliance/:id', auth.authenticate(), function(req, res) {
  var rand = [];
  for (var i = 0; i < 5; i++) {
    rand.push(Math.random());
  }
  res.successRes(null, rand);
});

/**
 * @api {get} /consumption/getSensors list of sensors for that user
 * @apiGroup Consumption
 *
 * @apiExample {curl} Example usage
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  http://localhost:3000/api/consumption/getSensors
 *
 * @apiSuccessExample {[json]} Success-Response:
 *   [
 *    0.1187375511508435,
 *    0.9294693802949041,
 *    0.1715518836863339,
 *    0.10940657090395689,
 *    0.6286844359710813
 *  ]
 */
router.get('/getSensors', auth.authenticate(), function(req, res) {
  console.log("getSensors", req.user._id)
  var rand = [];
  for (var i = 0; i < 5; i++) {
    rand.push(Math.random());
  }
  res.successRes(null, rand);
});

/**
 * @api {get} /consumption/last Last reading of consumption data
 * @apiGroup Consumption
 *
 * @apiParam {String} userId
 * @apiParam {String} token
 *
 * @apiExample {curl} Example usage
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "userId": "dummy",
 *    "token": "dummy"
 *  }' \
 *  http://localhost:3000/api/consumption/last
 *
 * @apiSuccessExample {[json]} Success-Response:
 * {
 *   consumption: 0.9164172718301415,
 * }
 */
router.get('/last', auth.authenticate(), function(req, res) {
  res.successRes(null, Math.random());
});

/**
 * @api {get} /consumption/tou Time of Usage
 * @apiGroup Consumption
 *
 * @apiParam {String} userId
 * @apiParam {String} token
 * @apiParam {Number} horizon must be one of the following [1,6,12,24,48,72]
 *
 * @apiExample {curl} Example usage
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "userId": "dummy",
 *    "token": "dummy",
 *    "horizon": 6
 *  }' \
 *  http://localhost:3000/api/consumption/tou
 *
 * @apiSuccessExample {[json]} Success-Response:
 *   [
 *    0.9164172718301415,
 *    0.1187375511508435,
 *    0.9294693802949041,
 *    0.1715518836863339,
 *    0.10940657090395689,
 *    0.6286844359710813
 *  ]
 */
router.get('/tou', auth.authenticate(), function(req, res) {
  var rand = [];
  for (var i = 0; i < req.body.horizon; i++) {
    rand.push(Math.random());
  }
  res.successRes(null, rand);
});

/**
 * @api {post} /consumption/getAllUsagePointsData Fetch all UsagePoints & Sensors from Reply
 * @apiGroup Consumption
 *
 * @apiParam {Boolean} AddUsagePoints adds new usage points only
 * @apiParam {Boolean} [UpdateUsagePoints] updates existing UsagePoints
 *   with new sensor data if available
 * @apiParam {[Number]} [ApartmentId] Adds/Updates the value of only
 *  that particular ApartmentId/Ids
 * @apiExample {curl} Example usage(PENDING-For now only data is fetched!!):
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    'AddUsagePoints': true,
 *    'UpdateUsagePoints': true,
 *    'ApartmentId': [14,17]
 *  }' \
 *  http://localhost:3000/api/consumption/getAllUsagePointsData
 *
 * @apiSuccessExample {[json]} Success-Response:
 *   [
 *    { ApartmentID: '14',
 *      Success: true,
 *      UsagePoint: { __v: 0, apartmentId: '14', _id: 55acb78868440371168b57c7 }
 *    },
 *    { ApartmentID: '42',
 *      Success: true,
 *      UsagePoint: { __v: 0, apartmentId: '42', _id: 55acb78868440371168b57cc }
 *    },
 *    { ApartmentID: '17',
 *      Success: true,
 *      UsagePoint: { __v: 0, apartmentId: '17', _id: 55acb78868440371168b57c8 }
 *    },
 *    { ApartmentID: '73',
 *      Success: true,
 *      UsagePoint: { __v: 0, apartmentId: '73', _id: 55acb78868440371168b57cd }
 *    }
 *   ]
 */
router.post('/getAllUsagePointsData', auth.authenticate(), function(req, res) {
  Consumption.getAllUsagePointsData(req.body, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Consumption Data',
    type: 'getAll',
    data: req.body
  });
});

/**
 * @api {get} /consumption/getUsagePoint/:apartmentId Get UsagePoint and sensors
 * @apiGroup Consumption
 *
 * @apiParam {String} apartmentId apartmentId of desired UsagePoint
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET "Authorization: Bearer $API_TOKEN" \
 *  http://localhost:3000/api/consumption/getUsagePoint/14
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *  "apartmentId":"14",
 *  "_id":"55af508c9210ee7b13342d8e",
 *  "__v":0,
 *  "Sensors":[
 *    {
 *    "sensorNumber":0,
 *    "sensorType":0,
 *    "measureUnit":"Wh",
 *    "label":"Consumo Elettrico",
 *    "lastSampleTimestamp":"2015-07-10T15:42:11.000Z",
 *    "_apartmentId":"55af508c9210ee7b13342d8e",
 *    "_id":"55af508d9210ee7b13342d90","__v":0
 *    },
 *    {
 *    "sensorNumber":1,
 *    "sensorType":1,
 *    "measureUnit":"Wh",
 *    "label":"Freezer",
 *    "lastSampleTimestamp":"2015-07-10T15:45:23.000Z",
 *    "_apartmentId":"55af508c9210ee7b13342d8e",
 *    "_id":"55af508d9210ee7b13342d91",
 *    "__v":0
 *    }]
 *  }
 */
router.get('/getUsagePoint/:apartmentId', auth.authenticate(), function(req, res) {
  Consumption.getUsagePoint(req.params.apartmentId, res.successRes);

  Log.create({
    userId: req.user._id,
    category: 'Consumption Data',
    type: 'getUP',
    data: req.body
  });
});

/**
 * @api {get} /downloadMyData Fetch IntervalBlock data from Reply
 * @apiGroup Consumption
 *
 * @apiParam {Integer} usagepoint ApartmentID/UsagePoint
 * @apiParam {Date} from Starting Date to fetch data from
 * @apiParam {Date} to Ending Date to fetch data from
 * @apiParam {String} [res='MONTHLY'] Other types RAW/DAILY/WEEKLY/MONTHLY. Stream will be
 * saved in db only if its MONTHLY.
 * @apiParam {String} [ctype='S_CONS'] S_CONS/S_PROD
 *
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d '{
 *   "usagepoint": 14,
 *   "from": "2015-06-01",
 *  "to":"2015-06-06",
 *  "type":"S_CONS",
 *  "res":"WEEKLY
 *  }' http://localhost:3000/api/consumption/downloadMyData
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *    "IntervalBlock": [
 *        {
 *            "__v": 0,
 *            "apartmentId": "14",
 *            "_apartmentId": "55af508c9210ee7b13342d8e",
 *            "type": "S_CONS",
 *            "kind": 0,
 *            "_id": "55b6427740e5c8de12e3aae1"
 *        }
 *    ],
 *    "IntervalReadings": [
 *        {
 *            "__v": 0,
 *            "_intervalBlockId": "55b6427740e5c8de12e3aae1",
 *            "value": "5928.74046667293",
 *            "timeslot": "F2",
 *            "_id": "55b6427740e5c8de12e3aae5",
 *            "timePeriod": {
 *                "start": "2015-05-31T22:00:00.000Z",
 *                "duration": 2592000,
 *                "datacoverage": 597586
 *            }
 *        },
 *        {
 *            "__v": 0,
 *            "_intervalBlockId": "55b6427740e5c8de12e3aae1",
 *            "value": "6627.6354826726",
 *            "timeslot": "F1",
 *            "_id": "55b6427740e5c8de12e3aaea",
 *            "timePeriod": {
 *                "start": "2015-05-31T22:00:00.000Z",
 *                "duration": 2592000,
 *                "datacoverage": 833685
 *            }
 *        },
 *        .....
 *    ]
 */
router.get('/downloadMyData', auth.authenticate(), function(req, res) {
  req.checkBody('usagepoint').isInt();
  req.checkBody('from').isDate();
  req.checkBody('to').isDate();
  Consumption.downloadMyData(
  req.body.usagepoint,
  req.body.from,
  req.body.to,
  req.body.res || 'MONTHLY',
  req.body.ctype || 'S_CONS',
  res.successRes
  );

  Log.create({
    userId: req.user._id,
    category: 'Consumption Data',
    type: 'getMyData',
    data: req.body
  });
});

module.exports = router;
