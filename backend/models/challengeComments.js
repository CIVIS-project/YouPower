'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChallengeCommentSchema = new Schema({
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
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

var ChallengeComment = mongoose.model('ChallengeComment', ChallengeCommentSchema);

exports.create = function(challengeId, user, comment, cb) {
  ChallengeComment.create({
    challengeId: challengeId,
    name: user.profile.name,
    email: user.email,
    comment: comment,
    date: new Date()
  }, cb);
};

exports.get = function(challengeId, limit, skip, cb) {
  ChallengeComment.find({challengeId: challengeId})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, challengeComments) {
    if (err) {
      cb(err);
    } else if (!challengeComments) {
      cb('Comments not found');
    } else {
      cb(null, challengeComments);
    }
  });
};

exports.delete = function(challengeId, id, cb) {
  ChallengeComment.remove({
    challengeId: challengeId,
    _id: id
  }, cb);
};

exports.ChallengeComment = ChallengeComment;
