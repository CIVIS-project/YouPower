'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
  UsagePoint.create({
    apartmentId: usagepoint
  }, function(err, up) {
    if (err) {
      //console.log('USAGEPOINT2Fail =', err);
      cb1 (err);
    } else {
      //console.log('USAGEPOINT2PAss =', up);
      cb1(null, up);
    }
  });
};

exports.getUsagePoint = function(apartmentId, cb) {
  UsagePoint.findOne({apartmentId: apartmentId}, false, cb);
};
exports.model = UsagePoint;
