'use strict';

var express = require('express');
var router = express.Router();
var Consumption = require('../models/consumption');
var passport = require('passport');

router.use(passport.authenticate('basic', {session: false}));

router.get('/:energyPlatformID',
  function(req, res) {
    Consumption.get(req.params.energyPlatformID, req.body,
      function(err, consumption) {
        if (err) {
          return res.status(501).send(err);
        }
        res.send(consumption);
      }
    );
  }
);

module.exports = router;
