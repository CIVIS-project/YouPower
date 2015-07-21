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
  },
  hasPicture: {
    type: Boolean,
    default: false
  }
});

var ActionComment = mongoose.model('ActionComment', ActionCommentSchema);

exports.create = function(actionComment, cb) {
  ActionComment.create({
    actionId: actionComment.actionId,
    name: actionComment.name,
    email: actionComment.email,
    comment: actionComment.comment,
    date: new Date()
  }, cb);
};

exports.setHasPicture = function(commentId, value, cb) {
  ActionComment.findOne({_id: commentId})
  .exec(function(err, actionComment) {
    if (err) {
      return cb(err);
    }
    if (!actionComment) {
      return cb('actionComment not found!');
    }

    actionComment.hasPicture = value;
    actionComment.save(cb);
  });
};

exports.get = function(actionId, limit, skip, cb) {
  ActionComment.find({actionId: actionId})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, actionComments) {
    if (err) {
      cb(err);
    } else if (actionComments && !actionComments.length) {
      cb('Comments not found');
    } else {
      cb(null, actionComments);
    }
  });
};

exports.delete = function(actionId, id, cb) {
  ActionComment.remove({
    actionId: actionId,
    _id: id
  }, cb);
};

exports.model = ActionComment;
