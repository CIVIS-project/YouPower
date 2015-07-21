'use strict';

var config = require('../config');
var request = require('request');
var moment = require('moment');
var xml2js = require('xml2js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

var UsagePointSchema = new Schema({
  apartmentId: {
    type: String,
    required: true,
    index: {unique: true}
  },
  city: {
    type: String,
    required: false
  },
  dsoId: {
    type: String,
    required: false
  },
  contractId: {
    type: String,
    required: false
  },
  pod: {
    type: String,
    required: false
  },
  tariffCode: {
    type: String,
    required: false
  },
  dwellers: {
    type: Number,
    required: false
  },
  kitType: {
    type: Number,
    required: false
  },
  pv: Boolean, //Set to True if Production is present
});

var UsagePoint = mongoose.model('UsagePoint', UsagePointSchema);

exports.create = function(usagepoint, cb1) {
  //console.log('USAGEPOINT1', usagepoint);
  UsagePoint.create({
    apartmentId: usagepoint
  }, function(err, up) {
    if (err) {
      console.log('USAGEPOINT2FF=' + usagepoint, err);
      cb1 (err);
    } else {
      console.log('USAGEPOINT2', up);
      cb1(null, up);
    }
  });
};

exports.model = UsagePoint;
