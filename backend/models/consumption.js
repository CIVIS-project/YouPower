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

var sensorSchema = new Schema({
  sensorNumber: {
    type: Number,
    required: true
  },
  _apartmentId: {
    type: Schema.Types.ObjectId,
    ref: 'UsagePoint',
    required: false
  },
  sensorType: {
    type: Number,
    required: false
  },
  measureUnit: {
    type: String,
    required: false
  },
  label: {
    type: String,
    required: false
  },
  lastSampleTimestamp: {
    type: Date,
    required: false
  },
});

var Sensor = mongoose.model('Sensor', sensorSchema);
var UsagePoint = mongoose.model('UsagePoint', UsagePointSchema);

var createAll = function(usagePt, cb1) {
  exports.createUsagePoint(usagePt.ApartmentID, function(err, up) {
    if (err) {
      cb1(err, {'ApartmentID': usagePt.ApartmentID, 'Success': false, 'ERROR': err});
    } else {
      async.each(usagePt.sensors.sensor, function(obj, callback) {
        exports.createSensors(obj, up, function(err) {
          if (err) {
            callback();
          } else {
            callback();
          }
        });
      }, function(err) {
        if (err) {cb1(err, {'ApartmentID': usagePt.ApartmentID, 'Success': false});}
        cb1(null, {'ApartmentID':usagePt.ApartmentID, 'Success': true, 'UsagePoint':up});
      });
    }
  });
};

exports.getAllSensors = function(usagepoint, cb) {

  request({
    url: config.civisURL + '/energyplatform.svc/getallsensors',
    qs: {
    }
  }, function(err, res, body) {
    if (err) {
      cb(err);
    } else {
      var parser = new xml2js.Parser({
        explicitArray: false
      });
      parser.parseString(body, function(err, result) {
        if (err) {cb(err);}
        var tempArr = [];
        async.each(result.entry.content.usagePoint, function(obj, callback) {
          createAll(obj, function(err, success) {
            if (err) {
              tempArr.push(success);
              callback();
            } else {
              tempArr.push(success);
              callback();
            }
          });
        }, function(err) {
          if (err) {cb(err);}
          cb(null, tempArr);
        });
      });
    }
  });
};

exports.createUsagePoint = function(usagepoint, cb1) {
  //console.log("USAGEPOINT",usagepoint)
  UsagePoint.create({
    apartmentId: usagepoint
  }, function(err, up) {
    if (err) {
      cb1 (err);
    } else {
      cb1(null, up);
    }
  });
};

exports.createSensors = function(sensor, up, cb1) {
  //console.log("SENSOR",sensor)
  Sensor.create({
    sensorNumber: sensor.sensorNumber,
    sensorType: sensor.sensorType,
    measureUnit: sensor.measureUnit,
    label: sensor.label ,
    lastSampleTimestamp: sensor.lastSampleTimestamp,
    _apartmentId: up._id
  }, function(err, sen) {
    if (err) {
      cb1 (err);
    } else {
      sen.save();
      cb1(null, sen);
    }
  });
};

exports.get = function(params, cb) {
  request({
    url: config.civisURL + '/downloadMyData',
    qs: {
      email: params.userId,
      token: params.token,
      from: moment(params.from).format('DD-MMM-YY hh:mm:SS A'),
      to: moment(params.to).format('DD-MMM-YY hh:mm:SS A'),
      res: params.res
    }
  }, function(err, res, body) {
    if (err) {
      cb(err);
    } else {
      var parser = new xml2js.Parser({
        // don't put arrays containing one element everywhere
        explicitArray: false
      });
      parser.parseString(body, function(err, result) {
        cb(err, result);
      });
    }
  });
};

exports.all = function(cb) {
  cb(null, []);
};

exports.allByUser = function(user, cb) {
  cb(null, []);
};

exports.model = UsagePoint;
exports.model = Sensor;
