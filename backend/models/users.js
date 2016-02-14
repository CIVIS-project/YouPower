'use strict';

var mongoose = require('mongoose');
var Action = require('./actions');
//var Community = require('./communities');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var mailer = require('../mailer')
var escapeStringRegexp = require('escape-string-regexp');
var achievements = require('../common/achievements');
var actionComments = require('./actionComments');
var communityComments = require('./communityComments');
var households = require('./households');
var cooperatives = require('./cooperatives');
var async = require('async');
var _ = require('underscore');
var FB = require('fb');
var crypto = require('crypto');
var moment = require('moment');

var UserSchema = new Schema({
  token: String,
  passwordResetToken: String,
  passwordResetTokenDate: Date,
  facebookId: String,
  accessToken: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  profile: {
    name: String,
    nickname: String,
    gender: String,
    // gender: {
    //   type: String,
    //   enum: 'Male Female'.split(' ')
    // },
    dob: Date,
    photo: String,
    language: {
      type: String,
      default: 'English'
    },
    testLocation:{
      type: String,
      required: true
    },
    toRehearse: {
      setByUser: {
        type: Boolean,
        default: false
      },
      declined: Boolean,
      done: Boolean,
      na: Boolean
    }
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
  },
  cooperativeId: Schema.Types.ObjectId,
  testbed: {
    type: Schema.Types.ObjectId,
    ref: 'Testbed'
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
  User.findOne({_id: id}, false)
  .populate('testbed')
  .exec(function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    var totalLeaves = 0;

    _.each(user.actions.done, function(action) {
      // leaves for actions: impact + effort
      totalLeaves += (action.impact + action.effort)*(action.alreadyDoingDate.length + action.doneDate.length);
    });

    // leaves for feedback: 1 leaf / feedback
    totalLeaves += user.numFeedback;

    var householdId = null;
    var pendingHouseholdInvites = [];
    var pendingCommunityInvites = ['TODO'];
    var cooperative = null;

    async.parallel([
      function(cb) {
        // find households user has been invited to
        households.findInvites(user._id, function(err, households) {
          if (err) {
            return cb(err);
          }

          pendingHouseholdInvites = households;

          cb();
        });
      },
      function(cb) {
        // find which household user is in
        households.getByUserId(user._id, function(err, household) {
          if (err) {
            return cb(err);
          }

          if (household) {
            householdId = household._id;
            return cb(null, household);
          }

          cb();
        });
      },
      function(cb) {
        // action comment count needed for leaf count
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
        // community comment count needed for leaf count
        communityComments.getByUser(user, null, null, function(err, cComments) {
          if (err) {
            return cb(err);
          }
          // leaves for community comments: 1 leaf / comment
          totalLeaves += cComments.length;
          cb();
        });
      },
      function(cb) {
        if(user.cooperativeId) {
          cooperatives.getProfile(user.cooperativeId,user,function(err,coop){
            if(err){
              return cb(err);
            }
            coop = coop.toObject();
            return cb(null, {
              id: coop._id,
              name: coop.name,
              extraInfo: coop.extraInfo
            });
          });
        } else {
          cb();
        }
      }
    ], function(err, results) {
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
        household: results[1],
        pendingHouseholdInvites: pendingHouseholdInvites,
        pendingCommunityInvites: pendingCommunityInvites,
        leaves: totalLeaves,
        energyConsumption: {}, // TODO
        cooperativeId: user.cooperativeId,
        cooperative: results[4],
        testbed: user.testbed
      });
    });
  });
};


exports.getInvites = function(id, cb) {
  User.findOne({_id: id}, false, function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    var householdId = null;
    var pendingHouseholdInvites = [];
    var pendingCommunityInvites = ['TODO'];

    async.parallel([
      function(cb) {
        // find households user has been invited to
        households.findInvites(user._id, function(err, households) {
          if (err) {
            return cb(err);
          }

          pendingHouseholdInvites = households;

          cb();
        });
      }
    ], function(err) {
      if (err) {
        return cb(err);
      }

      cb(null, {
        _id: id,
        pendingHouseholdInvites: pendingHouseholdInvites,
        pendingCommunityInvites: pendingCommunityInvites
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

  //console.log("q:" + JSON.stringify(q,null,4));

  var aQ = JSON.parse(JSON.stringify(q));

  for(var key in aQ) {
    if(aQ.hasOwnProperty(key)) {

      if(key === 'name') {
        aQ['profile.name'] = aQ['name'];
        delete aQ['name'];
      }else if(key === 'userId') {
        aQ['_id'] = aQ['userId'];
        delete aQ['userId'];
      }
    }
  }

  // pick any key that is present from the list [_id, profile.name, email]
  var keys = _.keys(aQ);
  var key = _.first(_.intersection(keys, ['_id', 'profile.name', 'email']));

  // if searching by _id require exact match, otherwise do a regexp search
  var filteredQ = {};
  filteredQ[key] = key === '_id' ? aQ[key].toString() :
    new RegExp('^' + escapeStringRegexp(String(aQ[key])) + '|' + escapeStringRegexp(String(aQ[key])) + '$', 'i');

  var query = User.find(filteredQ);
  query.select('email profile actions achievements recentAchievements accessToken');
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

  //console.log("profile: "+JSON.stringify(profile, null, 4));
  //console.log("user.profile1: "+JSON.stringify(user.profile, null, 4));


  // update any fields that are defined
  // not sure about this: need to see how to do this automatically
  if (profile.name !== undefined)
    user.profile.name = profile.name;
  if (user.profile.name === null)
    user.profile.name = undefined;
  if (profile.nickname !== undefined)
    user.profile.nickname = profile.nickname;
  if (user.profile.nickname === null)
    user.profile.nickname = undefined;
  if (profile.gender !== undefined)
    user.profile.gender = profile.gender;
  if (user.profile.gender === null)
    user.profile.gender = undefined;
  if (profile.dob !== undefined)
    user.profile.dob = profile.dob;
  if (user.profile.dob === null)
    user.profile.dob = undefined;
  if (profile.photo !== undefined)
    user.profile.photo = profile.photo;
  if (user.profile.photo === null)
    user.profile.photo = undefined;
  if (profile.language !== undefined)
    user.profile.language = profile.language;
  if (user.profile.language === null)
    user.profile.language  = undefined;
  if (profile.toRehearse !== undefined)
    user.profile.toRehearse = profile.toRehearse;
  if (user.profile.toRehearse === null)
    user.profile.toRehearse = undefined;

  //console.log("user.profile2: "+JSON.stringify(user.profile, null, 4));

  user.markModified('profile');
  // user.markModified('profile.name');
  // user.markModified('profile.nickname');
  // user.markModified('profile.gender');
  // user.markModified('profile.dob');
  // user.markModified('profile.photo');
  // user.markModified('profile.language');
  // user.markModified('profile.toRehearse');

  user.save(function(err) {
    cb(err, user.profile);
  });
};

exports.mailHouseholdMember = function(user, mail, cb) {
  mailer.invitation_personal(user, mail, cb);
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

function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
};

Date.prototype.isSameDateAs = function(aDate) {
  return (
    this.getFullYear() === aDate.getFullYear() &&
    this.getMonth() === aDate.getMonth() &&
    this.getDate() === aDate.getDate()
  );
};

exports.setActionState = function(user, actionId, state, postponed, cb) {
  Action.get(actionId, user, function(err, actionResult) {
    if (err) {
      return cb(err);
    }

    // get old UA, if any
    var userAction = getUA(user, actionId);
    if (_.isEmpty(userAction)){
      userAction.postponedDate = [];
      userAction.acceptedDate = [];
      userAction.startedDate = [];
      userAction.alreadyDoingDate = [];
      userAction.doneDate = [];
      userAction.canceledDate = [];
      userAction.declinedDate = [];
      userAction.naDate = [];
    }


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

    var today = new Date();
    var latestState = state;

    // state-specific logic
    if (state === 'pending') {
      postponed = new Date(postponed);
      if (!isValidDate(postponed)) {
        return cb('please provide a valid date in "postponed" field');
      }

      //does the scheudling as usual
      userAction.postponedDate.push(postponed);
      userAction.acceptedDate.push(today);

      if (userAction.latestState === 'pending'){
        //this is rescheduling
        if (postponed.isSameDateAs(today) || +postponed < +today){
          //frontend wants to reschudle to today or a past date (time)
          //activate the action (change state automatically to inProgess)
          userAction.startedDate.push(today);
          latestState = 'inProgress';
          state = 'inProgress';
        }else{
          //reschduel to a future date (starting from tomorrow), the reschdueld date may still be earlier than the last scheduled date.
        }
      }else{
        //this is change of state (the usual case), schedule to a future date
      }
    } else if (state === 'inProgress') {
      userAction.startedDate.push(today);
    } else if (state === 'alreadyDoing') {
      userAction.alreadyDoingDate.push(today);
      state = 'done';
    } else if (state === 'done') {
      userAction.doneDate.push(today);
    } else if (state === 'canceled') {
      userAction.canceledDate.push(today);
      state = 'declined';
    } else if (state === 'declined') {
      userAction.declinedDate.push(today);
    } else if (state === 'na') {
      userAction.naDate.push(today);
    } else {
      return cb('invalid value in "state" field');
    }

    userAction.latestDate = today;
    userAction.latestState = latestState;

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

exports.fbfriends = function(user, cb) {
  console.log('USER:',acct);
  var acct = user.accessToken;
  FB.setAccessToken(acct);
  console.log('user Token:',acct);
  FB.api('me/friends', function(res) {
    if (!res || res.error) {
      console.log('user foundYYY');
      cb('No data Received');
    } else {
      var tempArr = [];
      console.log('user foundXXX');
      async.each(res.data, function(obj, callback) {
          User.findOne({facebookId: obj.id}, '_id profile', function(err, user) {
            if (err) {
              callback();
            } else if (!user) {
              callback();
            } else {
              tempArr.push(user);
              callback();
            }
          });
        }, function(err) {
          if (err) {
            cb(err);
          }
          cb(null, tempArr);
        });
    }
  });
};

exports.postFB = function(user, postInfo, post, cb) {

  FB.setAccessToken(user.accessToken);
  FB.api('me/feed', 'post', post, function(res) {
    if (!res || res.error) {
      cb(res.error);
    } else {

      if (postInfo.type === "action") {
        Action.shared(postInfo.id, function(err, shares){
          res.shares = shares;
          cb(null, res);
        });
      }

    }
  });
};

exports.generatePasswordResetToken = function(email, cb) {
  User.findOne({email: email}, false, function(err, user){
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    user.passwordResetToken = crypto.randomBytes(12).toString('hex');
    user.passwordResetTokenDate = new Date();

    user.save(function(err) {
      mailer.resetPassword(user,cb);
    });
  });
}

exports.checkResetToken = function(token, cb) {
  User.findOne({passwordResetToken:token}, false, function(err, user) {
    if (err){
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    if (moment(user.passwordResetTokenDate).add(24, 'hours').isBefore(new Date())) {
      return cb('Reset token expired');
    }

    cb();
  });
}

exports.resetPassword = function(token, password, cb) {
  User.findOne({passwordResetToken:token}, false, function(err, user) {
    if (err){
      return cb(err);
    }
    if (!user) {
      return cb('User not found');
    }

    if (moment(user.passwordResetTokenDate).add(24, 'hours').isBefore(new Date())) {
      return cb('Reset token expired');
    }

    user.setPassword(password,function(err,user){
      if (err){
        return cb(err);
      }
      if (!user) {
        return cb('User not found');
      }

      user.passwordResetToken = undefined;
      user.passwordResetTokenDate = undefined;

      user.save(function(err) {
        cb(err);
      });
    });
  });
}

// Admin methods

exports.getSmappeeUsers = function(cb) {
  households.bySmappee(function(err, households){
    async.map(households,function(household, cb){
      household = household.toObject();
      exports.getProfile(household.ownerId,function(err,user){
        cb(err,user);
      })
    },function(err,results){
      cb(err,results);
    });
  })
}

exports.model = User;
