'use strict';

var config = require('../config');
var request = require('request');
var moment = require('moment');
var xml2js = require('xml2js');
var async = require('async');
var usagePoint = require('./usagePoint');
var sensor = require('./sensor');
var intervalBlock = require('./intervalBlock');
var intervalReading = require('./intervalReading');

exports.create = function(usagePt, cb1) {
  usagePoint.create(usagePt.ApartmentID, 'reply', function(err, up) {
    if (err) {
      cb1(err, {'ApartmentID': usagePt.ApartmentID, 'Success': false, 'ERROR': err});
    } else {
      async.each(usagePt.sensors.sensor, function(obj, callback) {
        sensor.create(obj, up, callback);
      }, function(err) {
        if (err) {
          cb1(err, {'ApartmentID': usagePt.ApartmentID, 'Success': false});
        }
        cb1(null, {ApartmentID:usagePt.ApartmentID, Success: true, UsagePoint:up});
      });
    }
  });
};

exports.getAllUsagePointsData = function(usagePoint, cb) {
  request({
    url: config.replyURL + '/energyplatform.svc/getallsensors',
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
        if (err) {
          cb(err);
        }
        var tempArr = [];

        async.each(result.entry.content.usagePoint, function(obj, callback) {
          exports.create(obj, function(err, success) {
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

var pushIR = function(ir, cb) {//helper function for downloadMyData
  var tempIr = {'value': ir.value, 'timeslot': ir.timeslot, 'timePeriod': ir.timePeriod};
  cb(null, tempIr);
};

exports.downloadMyData = function(usagepoint, from, to, resType, ctype, cb) {
  request({
    url: config.replyURL + '/InterfaceWP3.svc/downloadmydata',
    qs: {
      usagepoint: usagepoint,
      from: moment(from).format('YYYY-MM-DD'),
      to: moment(to).format('YYYY-MM-DD'),
      res: resType,
      type: ctype
    }
  }, function(err, res, body) {
    if (err) {
      cb(err);
    } else {
      var parser = new xml2js.Parser({
        explicitArray: false
      });
      parser.parseString(body, function(err, result) {
        if (err) {
          cb(err);
        }
        var tempArr = {'IntervalBlock':[], 'IntervalReadings':[]};
        if (false) {// if commented for not saving anything in the database
          usagePoint.getUsagePoint(result.feed.UsagePoint.ApartmentID, function(err, up) {
            if (err) {
              cb(err);
            }
            if (!up) {
              cb(null, 'UsagePoint not found');
            }
            //console.log('UP',up);
            intervalBlock.create(result.feed.UsagePoint, up._id, from, to, function(err, ib) {
              if (err) {
                cb(err);
              }
              tempArr.IntervalBlock.push(ib);
              async.each(result.feed.IntervalBlock.IntervalReading, function(obj, callback) {
                intervalReading.create(obj, ib._id, function(err, ir) {
                  if (err) {
                    tempArr.IntervalReadings.push(err);
                    callback();
                  } else {
                    tempArr.IntervalReadings.push(ir);
                    callback();
                  }
                });
              }, function(err) {
                if (err) {cb(err);}
                cb(null, tempArr);
              });
            });
          });
        } else {
          tempArr.IntervalBlock.push({
            'apartmentId': result.feed.UsagePoint.ApartmentID,
            'type': result.feed.UsagePoint.Type,
            'kind': result.feed.UsagePoint.ServiceCategory.kind
          });
          async.each(result.feed.IntervalBlock.IntervalReading, function(obj, callback) {
                pushIR(obj, function(err, ir) {
                  if (err) {
                    tempArr.IntervalReadings.push(err);
                    callback();
                  } else {
                    tempArr.IntervalReadings.push(ir);
                    callback();
                  }
                });
              }, function(err) {
                if (err) {cb(err);}
                cb(null, tempArr);
              });
        }
      });
    }
  });
};
