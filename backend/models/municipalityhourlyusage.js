'use strict';

var mongoose = require('mongoose');
var dateFormat = require('dateformat');
var moment = require('moment');
var momentTimeZone  = require('moment-timezone');
var Schema = mongoose.Schema;

/*
 * Logging model for usage statistics and metrics
 */

var MunicipalityHourlyUsageSchema = new Schema({
  ApartmentID:{
    type: Number
  },
  City: {
    type: String
  },
  DateTaken: {
    type: Date
  },
  HourlyTotal: {
    type: Number
  }
},{collection:'municipalityhourlyusage'});

var MunicipalityHourlyUsage = mongoose.model('MunicipalityHourlyUsage', MunicipalityHourlyUsageSchema);

exports.findMunicipalityHourlyUsage = function(dateRequested, cb) {
  var fromDate = moment(dateRequested).format('YYYY-MM-DD') + 'T00:00:00+2:00';
  var toDate = moment(dateRequested).format('YYYY-MM-DD') + 'T23:59:59+2:00';
  fromDate = new Date(moment(fromDate).toISOString());
  toDate = new Date(moment(toDate).toISOString());

  MunicipalityHourlyUsage.find({DateTaken:{$gte:fromDate,$lte:toDate}})
    .exec(function(err, hourlyUsage) {
    if (err) {
      console.log("error",err);
      cb(err);
    } else if(!hourlyUsage){
      console.log("No data returned");
      cb("Municipality hourly usage data not found");
    } else  {
      cb(null, hourlyUsage);
    }
  });
    
};

 //create hourly consumption if not found from the database 
exports.create = function(hourlyConsumption, cb) {
  var consumptionData= hourlyConsumption[0];
  var city = hourlyConsumption[1];
  consumptionData.forEach(function(hourlyData){
        MunicipalityHourlyUsage.create({
        ApartmentID: hourlyData.contractId,
        City: city,
        DateTaken: hourlyData.date,
        HourlyTotal: Number(hourlyData.consumption).toFixed(2)
      },function(err, hrlycons) {
    if (err) {
      cb (err);
    } else {
      hrlycons.save();
      cb(null, hrlycons);
    }
  });
  });
}; 
exports.model = MunicipalityHourlyUsage;