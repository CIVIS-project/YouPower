'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsagePointSchema = new Schema({
  apartmentId: {
    type: String,
    required: true,
    index: {unique: true}
  },
  familyId: {
    type: String,
    required: true,
    unique: true,
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

exports.create = function(usagepoint, cb) {
  UsagePoint.create({
    apartmentId: usagepoint.apartmentId,
    familyId: usagepoint.familyId
  }, cb);
};

exports.getUsagePoint = function(apartmentId, cb) {
  UsagePoint.findOne({apartmentId: apartmentId}, false, cb);
};
exports.model = UsagePoint;
