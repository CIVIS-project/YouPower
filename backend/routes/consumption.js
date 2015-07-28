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

module.exports = router;
