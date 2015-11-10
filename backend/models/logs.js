'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Logging model for usage statistics and metrics
 */

var LogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed
  },
  date: {
    type: Date,
    required: true
  }
});

var Log = mongoose.model('Log', LogSchema);

exports.create = function(log, cb) {
  Log.create({
    userId: log.userId,
    category: log.category,
    type: log.type,
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
  Log
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

exports.model = Log;
