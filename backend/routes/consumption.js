'use strict';

var express = require('express');
var router = express.Router();
var Consumption = require('../models').consumption;
var auth = require('../middleware/auth');

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
});

/**
 * @api {post} /consumption/getAllSensors Fetch all UsagePoints & Sensors from Reply
 * @apiGroup Consumption
 *
 * @apiParam {Boolean} AddUsagePoints adds new usage points only
 * @apiParam {Boolean} [UpdateUsagePoints] updates existing UsagePoints
 * 	with new sensor data if available
 * @apiParam {[Number]} [ApartmentId] Adds/Updates the value of only
 *	that particular ApartmentId/Ids
 * @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *		'AddUsagePoints': true,
 *		'UpdateUsagePoints': true,
 *		'ApartmentId': [14,17]
 *  }' \
 *  http://localhost:3000/api/consumption/getAllSensors
 *
 * @apiSuccessExample {[json]} Success-Response:
 *	 [
 *		{ ApartmentID: '14',
 *		  Success: true,
 *		  UsagePoint: { __v: 0, apartmentId: '14', _id: 55acb78868440371168b57c7 }
 *		},
 *		{ ApartmentID: '42',
 *		  Success: true,
 *		  UsagePoint: { __v: 0, apartmentId: '42', _id: 55acb78868440371168b57cc }
 *		},
 *		{ ApartmentID: '17',
 *		  Success: true,
 *		  UsagePoint: { __v: 0, apartmentId: '17', _id: 55acb78868440371168b57c8 }
 *		},
 *		{ ApartmentID: '73',
 *		  Success: true,
 *		  UsagePoint: { __v: 0, apartmentId: '73', _id: 55acb78868440371168b57cd }
 *		}
 *	 ]
 */
router.post('/getAllSensors', auth.authenticate(), function(req, res) {
  Consumption.getAllSensors(req.body, res.successRes);
});

module.exports = router;
