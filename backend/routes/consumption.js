'use strict';

var express = require('express');
var router = express.Router();
var Consumption = require('../models/consumption');

// TODO: auth
//var passport = require('passport');
//router.use(passport.authenticate('basic', {session: false}));

/**
 * @api {get} /consumption Get energy consumption data
 * @apiGroup Consumption
 *
 * @apiParam {String} userID CIVIS backend user ID
 * @apiParam {String} token CIVIS backend user token
 * @apiParam {String} from Start date string in simplified extended
 * ISO8601 format
 * @apiParam {String} to End date string in simplified extended
 * ISO8601 format
 * @apiParam {String} res Granularity of the answer. Possible values:
 * quarterly, hourly, daily, weekly, monthly
 *
 * @apiUse Authorization
 *
 * @apiVersion 1.0.0
 */
router.get('/', function(req, res) {
  Consumption.get(req.body,
    function(err, consumption) {
      if (err) {
        return res.status(500).send(err);
      }
      res.send(consumption);
    }
  );
});

module.exports = router;
