'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sensorSchema = new Schema({
  sensorNumber: {
    type: Number,
    required: true
  },
  _apartmentId: {
    type: Schema.Types.ObjectId,
    ref: 'UsagePoint',
    required: true
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

exports.create = function(sensor, up, cb) {
  console.log('SENSOR', sensor, up);
  Sensor.create({
    sensorNumber: sensor.sensorNumber,
    sensorType: sensor.sensorType,
    measureUnit: sensor.measureUnit,
    label: sensor.label ,
    lastSampleTimestamp: sensor.lastSampleTimestamp,
    _apartmentId: up._id
  }, function(err, sen) {
    if (err) {
      cb (err);
    } else {
      sen.save();
      //console.log('SENSOR Createrd', sensor.sensorNumber);
      cb(null, sen);
    }
  });
};

exports.getSensor = function(_apartmentId, cb) {
  //Sensor.find({_apartmentId: _apartmentId}, false, cb);

  Sensor.
  find({
    _apartmentId: _apartmentId
  }).
  //limit(2).
  sort({occupation: -1}).
  exec(cb);
};

exports.model = Sensor;
