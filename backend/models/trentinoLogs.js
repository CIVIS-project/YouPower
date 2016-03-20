'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Logging model for usage statistics and metrics -- trentino
 */

var trentinoLogSchema = new Schema({
  contractId: {
    type: String,
    require: true
  },
  category: {
    type: String,
    required: true
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  data: {
    type: Schema.Types.Mixed
  },
  date: {
    type: Date,
    required: true
  }
});

var trentinoLogs = mongoose.model('trentinologs', trentinoLogSchema);

exports.create = function(log, cb) {
  trentinoLogs.create({
    contractId: log.contractId,
    category: log.category,
    fromDate: log.fromDate,
    toDate: log.toDate,
    data: log.data,
    date: new Date()
  }, function(err, doc) {
    if (err) {
      /* istanbul ignore if: suppress messages when unit testing */
      if (process.env.NODE_ENV !== 'test') {
        console.log('error while logging:');
        console.log(err);
        console.log('this should never happen! fix your logging code to include required fields.');
      }
    }
    if (cb) {
      cb(err, doc);
    }
  });
};

exports.all = function(limit, skip, cb) {
  trentinoLogs
  .find({})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, log) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      cb(null, log);
    }
  });
};

exports.model = trentinoLogs;
