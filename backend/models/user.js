'use strict';

var mongoose = require('mongoose');
var Action = require('./action');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  token: String,
  facebookId: String,
  profile: {
    name: String,
    dob: Date,
    photo: String
  },
  actions: {
    // NOTE: mixed type schemas below,
    // http://mongoosejs.com/docs/schematypes.html#mixed
    done: {
      type: Object,
      default: {}
    },
    inProgress: {
      type: Object,
      default: {}
    },
    canceled: {
      type: Object,
      default: {}
    }
  },
  energyPlatformID: Number
});
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

exports.User = mongoose.model('User', UserSchema);

exports.startAction = function(user, actionId, cb) {
  Action.get(actionId, function(err, actionResult) {
    if (err) {
      cb(err);
    } else if (!actionResult) {
      cb('Action not found');
    } else {
      // store this action in inProgress list
      user.actions.inProgress[actionId] = actionResult;
      var action = user.actions.inProgress[actionId];

      action.startedDate = new Date();

      // get rid of the action in other lists
      delete(user.actions.done[actionId]);
      delete(user.actions.canceled[actionId]);

      // must be manually marked as modified due to mixed type schemas
      user.markModified('actions.inProgress');
      user.markModified('actions.done');
      user.markModified('actions.canceled');
      user.save(cb);
    }
  });
};

exports.cancelAction = function(user, actionId, cb) {
  var action = user.actions.inProgress[actionId];

  if (!action) {
    cb('Action not in progress');
  } else {
    // store this action in canceled list
    user.actions.canceled[actionId] = action;

    action.canceledDate = new Date();

    // get rid of the action in other lists
    delete(user.actions.done[actionId]);
    delete(user.actions.inProgress[actionId]);

    // must be manually marked as modified due to mixed type schemas
    user.markModified('actions.inProgress');
    user.markModified('actions.done');
    user.markModified('actions.canceled');
    user.save(cb);
  }
};

exports.completeAction = function(user, actionId, cb) {
  var action = user.actions.inProgress[actionId];

  if (!action) {
    cb('Action not in progress');
  } else {
    // store this action in done list
    user.actions.done[actionId] = action;

    action.doneDate = new Date();

    // get rid of the action in other lists
    delete(user.actions.canceled[actionId]);
    delete(user.actions.inProgress[actionId]);

    // must be manually marked as modified due to mixed type schemas
    user.markModified('actions.inProgress');
    user.markModified('actions.done');
    user.markModified('actions.canceled');
    user.save(cb);
  }
};
