'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
  name: {
    type: String,
    default: 'Anonymous'
  },
  kind: {
    type: String,
    enum: 'general actionCompleted actionCanceled'.split(' '),
    required: true,
  },
  email: {
    type: String,
    default: 'Anonymous'
  },
  content: {
    type: Schema.Types.Mixed,
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
    kind: feedback.kind,
    email: feedback.email,
    content: feedback.content,
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
