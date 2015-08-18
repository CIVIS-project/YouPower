'use strict';

var mongoose = require('mongoose');
var Action = require('./actions');
//var Community = require('./communities');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var escapeStringRegexp = require('escape-string-regexp');
var achievements = require('../common/achievements');
var actionComments = require('./actionComments');
var communityComments = require('./communityComments');
var households = require('./households');
var async = require('async');
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
  // contains state of each achievement
  achievements: {
    type: Object,
    default: {}
  },
  // contains three most recent achievements
  recentAchievements: {
    type: Object,
    default: {}
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
      type: Schema.Types.Mixed,
      default: {}
    },

    // user is done performing action
    done: {
      type: Object,
      default: {}
    },

    // user has declined an action or canceled an action that they were already performing
    declined: {
      type: Object,
      default: {}
    },

    // user has specified that the action is not applicable to them
    na: {
      type: Object,
      default: {}
    }
  },
  numFeedback: {
    type: Number,
    default: 0
  },
  // how many PVs does the user have that can produce energy?
  production: {
    type: Number,
    default: 0
  }
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

    var totalLeaves = 0;

    _.each(user.actions.done, function(action) {
      // leaves for actions: impact + effort
      totalLeaves += action.impact + action.effort;
    });

    // leaves for feedback: 1 leaf / feedback
    totalLeaves += user.numFeedback;

    var householdId = null;

    async.parallel([
      function(cb) {
        households.getByUserId(user._id, function(err, household) {
          if (household) {
            householdId = household._id;
          }

          cb();
        });
      },
      function(cb) {
        actionComments.getByUser(user, null, null, function(err, aComments) {
          if (err) {
            return cb(err);
          }
          // leaves for action comments: 1 leaf / comment
          totalLeaves += aComments.length;
          cb();
        });
      },
      function(cb) {
        communityComments.getByUser(user, null, null, function(err, cComments) {
          if (err) {
            return cb(err);
          }
          // leaves for community comments: 1 leaf / comment
          totalLeaves += cComments.length;
          cb();
        });
      }
    ], function(err) {
      if (err) {
        return cb(err);
      }

      cb(null, {
        _id: id,
        email: user.email,
        profile: user.profile,
        actions: user.actions,
        accessToken: user.accessToken,
        facebookId: user.facebookId,
        production: user.production,
        householdId: householdId,
        leaves: totalLeaves,
        energyConsumption: {} // TODO
      });
    });
  });
};

// //Display user's communities (member of which community?)
// exports.getUserCommunities = function(id, cb) {
//   User.findOne({_id: id}, function(err, user) {
//     /* istanbul ignore if: db errors are hard to unit test */
//     if (err) {
//       return cb(err);
//     }
//     console.log(user._id);
//     Community.model
//     .find({members: {$in : user._id}})
//     .exec(function(err, communities) {
//       if (err) {
//         return cb(err);
//       }
//       if (!communities) {
//         return cb('Community not found');
//       } else {
//         console.log(communities);
//         // convert every returned action into a raw object (remove mongoose magic)
//         for (var i = 0; i < communities.length; i++) {
//           communities[i] = communities[i].toObject();
//         }
//         cb(null, communities);
//       }
//     });
//   });
// };

//Display user's actions
//Display user's actions based on 'type' passed.
//May be there is better way to do this?
exports.getUserActions = function(id, type, cb) {
  User.findOne({_id: id} , function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    } else {
      switch (type)
      {
        case 'progress':
          return cb(null, user.actions.inProgress);
        case 'pending':
          return cb(null, user.actions.pending);
        case 'done':
          return cb(null, user.actions.done);
        case 'declined':
          return cb(null, user.actions.declined);
        case 'na':
          return cb(null, user.actions.na);
        default:
          return cb(null, user.actions);
      }
    }
  });
};

/*exports.getUserChallenges = function(id, cb) {
  User.findOne({_id: id} , function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    } else {
        return cb(null, user.actions);
      }
    }
  });
};*/

exports.find = function(q, multi, limit, skip, cb) {
  // pick any key that is present from the list [_id, profile.name, email]
  var keys = _.keys(q);
  var key = _.first(_.intersection(keys, ['_id', 'profile.name', 'email']));

  // if searching by _id require exact match, otherwise do a regexp search
  var filteredQ = {};
  filteredQ[key] = key === '_id' ? q[key].toString() :
    new RegExp('^' + escapeStringRegexp(String(q[key])), 'i');

  var query = User.find(filteredQ);
  query.select('email profile actions achievements recentAchievements');
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
    user.actions.declined[actionId] ||
    user.actions.na[actionId] ||
    {};
};

exports.setActionState = function(user, actionId, state, postponed, cb) {
  Action.get(actionId, null, function(err, actionResult) {
    if (err) {
      return cb(err);
    }

    // get old UA, if any
    var userAction = getUA(user, actionId);

    // update the UA with new data
    userAction._id = actionId;
    userAction.name = actionResult.name;
    userAction.description = actionResult.description;
    userAction.effort = actionResult.effort;
    userAction.impact = actionResult.impact;
    userAction.category = actionResult.category;

    // temporarily get rid of the UA from all UA lists
    delete(user.actions.pending[actionId]);
    delete(user.actions.inProgress[actionId]);
    delete(user.actions.done[actionId]);
    delete(user.actions.declined[actionId]);
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
      userAction.wasCanceled = true;
      userAction.declineDate = new Date();
      state = 'declined';
    } else if (state === 'declined') {
      userAction.declineDate = new Date();
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
    user.markModified('actions.declined');
    user.markModified('actions.na');
    user.save(function(err) {
      cb(err, user.actions);
    });
  });
};

exports.getAchievements = function(user, cb) {
  var stats = achievements.getStats(user);

  cb(null, {
    stats: stats,
    recentAchievements: user.recentAchievements
  });
};

exports.model = User;
