'use strict';

var mongoose = require('mongoose');
var Action = require('./actions');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var escapeStringRegexp = require('escape-string-regexp');
var _ = require('underscore');

var UserSchema = new Schema({
  token: String,
  facebookId: String,
  accessToken: String,
  profile: {
    name: String,
    dob: Date,
    photo: String,
    gender: String
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
  usernameField: 'email',
  // do fewer pbkdf2 hashing iterations when unit testing for performance reasons
  iterations: process.env.NODE_ENV === 'test' ? 1 : /* istanbul ignore next */ 25000
});

var User = mongoose.model('User', UserSchema);

exports.authenticate = User.authenticate;
exports.serializeUser = User.serializeUser;
exports.deserializeUser = User.deserializeUser;

exports.register = function(userInfo, password, cb) {
  User.register(new User(userInfo), password, cb);
};
exports.create = function(userInfo, cb) { // alias for unit tests
  exports.register(userInfo, userInfo.password, cb);
};

exports.getProfile = function(id, cb) {
  User.findOne({_id: id}, false, function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    cb(null, {
      email: user.email,
      profile: user.profile,
      actions: user.actions,
      energyConsumption: {}, // TODO
      topActions: [], // TODO
      topChallenges: [], // TODO
      topCommunities: [], // TODO
      topFriends: [] // TODO
    });
  });
};

exports.find = function(q, multi, limit, skip, cb) {
  // pick any key that is present from the list [_id, profile.name, email]
  var keys = _.keys(q);
  var key = _.first(_.intersection(keys, ['_id', 'profile.name', 'email']));

  // if searching by _id require exact match, otherwise do a regexp search
  var filteredQ = {};
  filteredQ[key] = key === '_id' ? q[key].toString() :
    new RegExp('^' + escapeStringRegexp(String(q[key])), 'i');

  var query = User.find(filteredQ);
  query.select('email profile actions');
  query.limit(limit);
  query.skip(skip);
  query.exec(function(err, res) {
    // return array if multi is true, otherwise return first element
    cb(err, multi ? res : res[0]);
  });
};

// NOTE: the rest of these functions go against the convention of taking in a
// model id instead of the model itself. Reason for this is that
// passport-local-mongoose gives us the user model after each a successful
// authentication, and it would be wasteful to fetch it again here

exports.updateProfile = function(user, profile, cb) {
  // update any fields that are defined
  user.profile.name  = profile.name  || user.profile.name;
  user.profile.dob   = profile.dob   || user.profile.dob;
  user.profile.photo = profile.photo || user.profile.photo;

  user.markModified('profile.name');
  user.markModified('profile.dob');
  user.markModified('profile.photo');

  user.save(function(err) {
    cb(err, user.profile);
  });
};

exports.startAction = function(user, actionId, cb) {
  Action.get(actionId, function(err, actionResult) {
    if (err) {
      cb(err);
    } else {
      // store this action in inProgress list
      user.actions.inProgress[actionId] = {};
      var action = user.actions.inProgress[actionId];

      action.id = actionId;
      action.name = actionResult.name;
      action.description = actionResult.description;
      action.effort = actionResult.effort;
      action.impact = actionResult.impact;
      action.activation = actionResult.activation;
      action.category = actionResult.category;
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

exports.model = User;
