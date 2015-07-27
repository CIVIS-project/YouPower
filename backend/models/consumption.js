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
  //console.log('TETS', usagePt);
  usagePoint.create(usagePt.ApartmentID, function(err, up) {
    if (err) {
      cb1(err, {'ApartmentID': usagePt.ApartmentID, 'Success': false, 'ERROR': err});
    } else {
      async.each(usagePt.sensors.sensor, function(obj, callback) {
        sensor.create(obj, up, callback);
      }, function(err) {
        if (err) {
          console.log('EROR in SENSOR');
          cb1(err, {'ApartmentID': usagePt.ApartmentID, 'Success': false});
        }
        cb1(null, {ApartmentID:usagePt.ApartmentID, Success: true, UsagePoint:up});
      });
    }
  });
};

exports.getAllUsagePointsData = function(usagepoint, cb) {

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

        async.each(result.entry.content.usagePoint.slice(2, 3), function(obj, callback) {
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

exports.getUsagePoint = function(apartmentId, cb) {
  usagePoint.getUsagePoint(apartmentId, function(err, up) {
    if (err) {
      return cb(err);
    }
    if (!up) {
      return cb('UsagePoint not found');
    }
    sensor.getSensor(up._id, function(err, sensors) {
      if (err) {
        return cb(err, up);
      }
      var usagepoint = up.toObject();
      usagepoint.Sensors = sensors;
      cb(null, usagepoint);
    });

  });
};

exports.downloadMyData = function(usagepoint, from, to, res, ctype, cb) {

//console.log('VALUES',usagepoint,from,to,res,ctype,moment(from).format('YYYY-MM-DD'));
  var r=request({
    url: config.civisURL + '/InterfaceWP3.svc/downloadmydata',
    qs: {
      usagepoint: usagepoint,
      //from: moment(from).format('YYYY-MM-DD'),
      from: moment(from).format('YYYY-MM-DD'),
      to: moment(to).format('YYYY-MM-DD'),
      res: res,
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
        if (err) {cb(err);}
        var tempArr = [];
        //console.log(r.url);
        //console.log('Results', JSON.stringify(result));
        usagePoint.getUsagePoint(result.feed.UsagePoint.ApartmentID, function(err, up) {
          if (err) {
            cb(err);
          }
          if (!up) {
            cb(null,'UsagePoint not found');
          }
          console.log('UP',up);
          intervalBlock.create(result.feed.UsagePoint, up._id, function(err, ib){
            if (err) {
              cb(err);
            }
            //console.log('YIPPIE', ib)
            intervalReading.create(result.feed.IntervalBlock.IntervalReading[0],ib._id, function(err, ir) {
              if (err) console.log(err);
              console.log('SUCCESS',ir)
            });

          });
        });  
      });
    }
  });
};

