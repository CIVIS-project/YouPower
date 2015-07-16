'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
  name: {
    type: String,
    default: 'Anonymous'
  },
  email: {
    type: String,
    default: 'Anonymous'
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

var Feedback = mongoose.model('Feedback', FeedbackSchema);

exports.create = function(feedback, cb) {
  Feedback.create({
    name: feedback.name,
    email: feedback.email,
    comment: feedback.comment,
    date: new Date()
  }, cb);
};

exports.all = function(limit, skip, cb) {
  Feedback
  .find({})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, feedback) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      cb(null, feedback);
    }
  });
};

exports.model = Feedback;
