'use strict';

var config = require('../config');
var request = require('request');
var moment = require('moment');
var xml2js = require('xml2js');
var usagePoint = require('./usagePoint');
var sensor = require('./sensor');
var Household = require('./households');
var Reply = require('./reply');

exports.getAllUsagePointsData = function(usagepoint, cb) {
  switch (usagepoint.dataProvider) {//switch for differnt data providers
    case 'reply': {
      Reply.getAllUsagePointsData(usagepoint, cb);
    } break;
    default: {
      Reply.getAllUsagePointsData(usagepoint, cb);
    } break;
  }
};

//Wont be working, need to fix it by first finding out the usagepoint
//belonging to the specified user
exports.get = function(params, cb) {
  request({
    url: config.replyURL + '/downloadMyData',
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

exports.getAllSensorsForUser = function(userId, cb) {
  Household.getHouseholdByUserId(userId, function(err, household) {
    if (err) {
      cb(err);
    } else {
      //console.log('Household',household);
      var applianceList = [{appliances : household.appliancesList}];
      //console.log('APPLIANCELIST',applianceList);
      exports.getUsagePoint(household.apartmentId, function(err, up) {
        if (err) {
          cb(err);
        } else if (!up) {
          cb(null, applianceList);
        } else {
          applianceList.push({sensors : up.Sensors});
          cb(null, applianceList);
        }
      });
    }
  });
};

exports.downloadMyData = function(usagepoint, from, to, resType, ctype, cb) {
  usagePoint.getUsagePoint(usagepoint, function(err, up) {
    if (err) {
      cb(err);
    } else if (!up) {
      cb(null, 'Requested UsagePoint not found');
    } else {
      switch (up.dataProvider) {
        case 'reply': {
          Reply.downloadMyData(usagepoint, from, to, resType, ctype, cb);
        } break;
        default: {
          Reply.downloadMyData(usagepoint, from, to, resType, ctype, cb);
        } break;
      }
    }
  });
};
