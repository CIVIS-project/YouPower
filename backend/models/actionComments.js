'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActionCommentSchema = new Schema({
  actionId: {
    type: Schema.Types.ObjectId,
    ref: 'Action',
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

var ActionComment = mongoose.model('ActionComment', ActionCommentSchema);

exports.create = function(actionId, user, comment, cb) {
  ActionComment.create({
    actionId: actionId,
    name: user.profile.name,
    email: user.email,
    comment: comment,
    date: new Date()
  }, cb);
};

exports.get = function(actionId, limit, skip, cb) {
  ActionComment.find({actionId: actionId})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, actionComments) {
    if (err) {
      cb(err);
    } else if (!actionComments) {
      cb('Comments not found');
    } else {
      actionComments = actionComments.toObject();
      cb(null, actionComments);
    }
  });
};

exports.delete = function(id, cb) {
  // TODO: check that user is authorized to do this (email matches or is admin)
  ActionComment.remove({
    _id: id
  }, cb);
};

exports.ActionComment = ActionComment;
