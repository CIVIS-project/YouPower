'use strict';

var mongoose = require('mongoose');
var Action = require('./').actions;
//var Community = require('./communities').Community;
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var escapeStringRegexp = require('escape-string-regexp');
var _ = require('underscore');

var UserSchema = new Schema({
  token: String,
  facebookId: String,
  profile: {
    name: String,
    dob: Date,
    photo: String,
    gender: String
  },
  actions: {
    // NOTE: mixed type schemas below,
    // http://mongoosejs.com/docs/schematypes.html#mixed

    // user has postponed action
    pending: {
      type: Object,
      default: {}
    },

    // user is performing action
    inProgress: {
      type: Object,
      default: {}
    },

    // user is done performing action
    done: {
      type: Object,
      default: {}
    },

    // user has canceled an action that they were performing
    canceled: {
      type: Object,
      default: {}
    },

    // user has specified that the action is not applicable to them
    na: {
      type: Object,
      default: {}
    }
  },
  communities: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    }
  ]
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

//Display user's communities (member of which community?)
exports.getUserCommunities = function(id, cb) {
  User.findOne({_id: id} , function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    } else {
      cb(null, user);
    }
    // else {
    //   Community.find({_id: {$in : user.communities}}, function(err, communities) {
    //     if (err) {
    //       return cb(err);
    //     }
    //     if (!communities) {
    //       return cb('Community not found');
    //     } else {
    //       // convert every returned action into a raw object (remove mongoose magic)
    //       for (var i = 0; i < communities.length; i++) {
    //         communities[i] = communities[i].toObject();
    //       }
    //       cb(null, communities);
    //     }
    //   });
    // }
  });
};
//Display user's actions (in progress)
exports.getUserActions = function(id, cb) {
  User.findOne({_id: id} , function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    } else {
      return cb(null, user);
    }
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

// fetch user action by id
var getUA = function(user, actionId) {
  return user.actions.pending[actionId] ||
    user.actions.inProgress[actionId] ||
    user.actions.done[actionId] ||
    user.actions.canceled[actionId] ||
    user.actions.na[actionId] ||
    {};
};

exports.setActionState = function(user, actionId, state, postponed, cb) {
  Action.get(actionId, function(err, actionResult) {
    if (err) {
      return cb(err);
    }

    // get old UA, if any
    var userAction = getUA(user, actionId);

    // update the UA with new data
    userAction.id = actionId;
    userAction.name = actionResult.name;
    userAction.description = actionResult.description;
    userAction.effort = actionResult.effort;
    userAction.impact = actionResult.impact;
    userAction.category = actionResult.category;

    // temporarily get rid of the UA from all UA lists
    delete(user.actions.pending[actionId]);
    delete(user.actions.inProgress[actionId]);
    delete(user.actions.done[actionId]);
    delete(user.actions.canceled[actionId]);
    delete(user.actions.na[actionId]);

    // state-specific logic
    if (state === 'pending') {
      if (!postponed || !_.isDate(postponed)) {
        return cb('please provide a valid date in "postponed" field');
      }
      userAction.postponed = postponed;
    } else if (state === 'inProgress') {
      userAction.startedDate = new Date();
    } else if (state === 'alreadyDoing') {
      userAction.doneDate = new Date();
      userAction.alreadyDoing = true;
      state = 'done';
    } else if (state === 'done') {
      userAction.doneDate = new Date();
    } else if (state === 'canceled') {
      userAction.cancelDate = new Date();
    } else if (state === 'na') {
      userAction.naDate = new Date();
    } else {
      return cb('invalid value in "state" field');
    }

    user.actions[state][actionId] = userAction;

    // must be manually marked as modified due to mixed type schemas
    user.markModified('actions.pending');
    user.markModified('actions.inProgress');
    user.markModified('actions.done');
    user.markModified('actions.canceled');
    user.markModified('actions.na');
    user.save(cb);
  });
};

exports.model = User;
