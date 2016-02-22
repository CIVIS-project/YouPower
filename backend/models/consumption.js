'use strict';

var config = require('../config');
var request = require('request');
var moment = require('moment');
var xml2js = require('xml2js');
var async = require('async');
var _ = require('underscore');
var usagePoint = require('./usagePoint');
var sensor = require('./sensor');
var intervalBlock = require('./intervalBlock');
var intervalReading = require('./intervalReading');
var Household = require('./households');
var normalisation = require('../common/normalisation')

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

var pushIR = function(ir, cb) {
  var tempIr = {'value': ir.value, 'timeslot': ir.timeslot, 'timePeriod': ir.timePeriod};
  cb(null, tempIr);
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
  request({
    url: config.civisURL + '/InterfaceWP3.svc/downloadmydata',
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

// Stockholm Energimolnet consumption

var energimolnetHeaders = {
  Authorization: 'OAuth a4f4e751401477d5e3f1c68805298aef9807c0eae1b31db1009e2ee90c6e'
};

var getConsumptionFromAPI = function(meterId, granularity, from, to, cb) {
  var to = to ? '-' + to : '';
  console.log(meterId,granularity,from,to);
  request({
    url: 'https://app.energimolnet.se/api/2.0/consumptions/'+ meterId + '/' + granularity + '/' + from + to + '/',
    headers: energimolnetHeaders
  },function(error, response, body){
    if(!error && response.statusCode == 200) {
      var result = JSON.parse(body).data[0].periods[0].energy;
      cb(null, result);
    } else {
      cb(error);
    }
  });
}

var uniqueApiCallHash = function(meters, type, granularity, from, to) {
  var result = _.chain(meters)
    .filter(function(meter){ return meter.mType == type && meter.useInCalc})
    .map(function(meter){return meter.meterId})
    .reduce(function(memo,value){return  memo + "-" + value})
    .value();
  result = result + '-' + type + '-' + granularity + '-' + from + '-' + to;
  return result;
}

var getRawEnergimolnetConsumption = async.memoize(function(meters, type, granularity, from, to, cb) {
  var meterIds = _.filter(meters, function(meter){ return meter.mType == type && meter.useInCalc});
  async.map(meterIds, function(meter,cb2){
    getConsumptionFromAPI(meter.meterId, granularity, from, to, cb2);
  },function(err,results){
    if(err) {
      cb(err);
    } else {
      var result = _.chain(results)
        .unzip()
        .map(function(data,index){
          return _.reduce(data,function(a,b){return a+b;},0);
        })
        .map(function(value){
          return value;
        })
        .value();
      cb(null,result);
    }
  });
},uniqueApiCallHash);

exports.getEnergimolnetConsumption = function(meters, type, granularity, from, to, cb) {
  getRawEnergimolnetConsumption(meters,type,granularity,from,to,function(err, results){
    console.log('Meters', meters);
    console.log('Type', type);
    if(type == 'heating') {
      normalisation.normalizeHeating(meters,from,to,results,getRawEnergimolnetConsumption,cb);
    } else {
      cb(err,results);
    }
  });
}




var computeCheckDigit = function(numberStr) {
  var oddSum = 0;
  var evenSum = 0;
  _.each(numberStr,function(digit,index){
    if(index % 2) {
      evenSum += parseInt(digit);
    } else {
      oddSum += parseInt(digit);
    }
  })
  return (oddSum*3 + evenSum) % 10;
}

var fs=require("fs");
var readline=require("readline");

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var CIVIS_DATA= __dirname + "/../../../civis-data/localCSV/";

var meterdata={"EL":{},"VV":{}};

readMeterData();

function readMeterData(){
    try{
      var files = fs.readdirSync(CIVIS_DATA).filter(function(name){return name.endsWith(".txt");})
      async.forEachOf(files, function(nm, index, cb){
        try {
          var file = fs.createReadStream(CIVIS_DATA+nm);
      	  readline.createInterface({terminal: false, input:file})
      		.on('line', function(line){
      		    if(!line)
      			return;
          		    var ln= line.split(";");
          		    var startDate= ln[1].split('-');

          		    if(!meterdata[ln[3]][ln[0]])
          			meterdata[ln[3]][ln[0]]={};
          		    if(!meterdata[ln[3]][ln[0]][parseInt(startDate[0])])
          			meterdata[ln[3]][ln[0]][parseInt(startDate[0])]=Array(12);

          		    meterdata[ln[3]][ln[0]][parseInt(startDate[0])][parseInt(startDate[1])-1]=parseFloat(ln[6].replace(',','.'));
      		}).on('close',function(){
            cb();
          });
        }catch(e) {
          cb(e);
        }
      }, function(err){
        if(err){
          console.log("Static Stockholm consumption data not found ",err.message);
          console.log(err.stack);
          return;
        }
        // Create unique IDs
        _.each(meterdata.EL,function(value, key){
          var code = computeCheckDigit(key.replace(/-/g,'')) + String("0000" + parseInt(key.split("-")[1])*3).slice(-4);
          Household.lookup.findOne({apartmentId:key},function(err,lookupResult){
            if(err) {
              console.log("Error generating code for:", key);
            } else {
              if(!lookupResult) {
                Household.lookup.create({apartmentId:key, uniqueCode: code});
              } else {
                if(lookupResult.uniqueCode != code) {
                  console.error("Key already exists but not the same", key, code, lookupResult.uniqueCode);
                }
              }
            }
          });
        });

      });
    }catch(x){
    	console.log("Static Stockholm consumption data not found ",x.message);
    	console.log(x.stack);
    }
}

var typeMap={electricity:'EL', "hot_water":'VV'};

exports.data=meterdata;
// Stockholm Self Hosted consumption

exports.getStoredConsumption = function(meterId, type, granularity, from, to, cb) {
  try{
    var fromYear = parseInt(from.substring(0, 4));
    var ret= meterdata[typeMap[type]][meterId][fromYear] || Array(12);
    if(from.length>4)
     ret= ret.slice(parseInt(from.substring(4, 6))-1);
   if(to){
     var toYear = parseInt(to.substring(0, 4));
     if(toYear != fromYear) { //If they're the same year, we assume that from will cover the whole range
       var t= meterdata[typeMap[type]][meterId][toYear] || Array(12);
       if(to.length>4){
         t=t.slice(0, parseInt(to.substring(4, 6)));
       }
       ret= Array.prototype.concat(ret, t);
     } else {
       if(to.length>4) {
         ret = ret.slice(0, parseInt(to.substring(4, 6))-parseInt(from.substring(4, 6))+1)
       }
     }
   }
   cb(null, ret);
 }
 catch(e) {
  console.error(e);
  cb(e);
}

    // TODO Cristi: implement the API
    // _meterId_ is any string uniquely identifying the meter, if you think we might have more than 1 meter per household we can change it to an array
    // _from_ and _to_ can be any combination of YYYY, YYYYMM, YYYYMMDD; _to_ can also be left out
    // granularity can be year, month, day, hour
    // the call always returns an array of values
    // the array is of exact size of the expected number of values depending on the from/to and granularity
    // and returning null for values that don't exist
    // e.g. for { from:2015,  granularity: 'month'} it will return 12 values where last will be null
    // if granularity parameter is finer than data stored it should return all nulls, while in other case it should do the aggregation

    /*
[13/11/15 13:46:16] Filip Kis: 1) 201411-201510 (default, to load last 12 months)
[13/11/15 13:47:00] Filip Kis: 2) 201410 (to load just one month, i.e. I get one result back, when I move left in graph from previous default)
[13/11/15 13:47:47] Filip Kis: 3) 2010-2015 (for the yearly view)
*/
};


