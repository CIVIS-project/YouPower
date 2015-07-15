'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

/*
 * Logging model for usage statistics and metrics
 */

var LogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
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
    type: Schema.Types.Mixed,
    required: true
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
  }, cb || _.noop);
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
