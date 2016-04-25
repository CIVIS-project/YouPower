'use strict';

var mongoose = require('mongoose');
var dateFormat = require('dateformat');
var Schema = mongoose.Schema;

/*
 * Logging model for usage statistics and metrics
 */

var usageSummarySchema = new Schema({
  City: {
    type: String
  },
  Green: {
    type: Number
  },
  Red: {
    type: Number
  },
  UsagePoint: {
    type: String
  },
  DateTakenLast:{
    type: Date
  }
},{collection:'usagesummary'});

var UsageSummary = mongoose.model('UsageSummary', usageSummarySchema);
module.exports = UsageSummary;

module.exports.findTotalUsageSummary = function(cb) {
  UsageSummary.find({})
    .exec(function(err, summary) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else if(!summary){
      cb("No summary information found");
    } else  {
      cb(null, summary);
    }
  });
    
};