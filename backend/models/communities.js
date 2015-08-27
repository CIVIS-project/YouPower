'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

var User = require('./users');
var Action = require('./actions');
var Household = require('./households');
var Consumption = require('./consumption');
var async = require('async');

//Community Schema
var CommunitySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  // refer user schema
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  ratings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  date: {
    type: Date,
    required: true

  },
  ownerId: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
  privacy: {
     type:String,
     enum:['Open' , 'Closed'],
     default : 'Open'
   }
});
var Community = mongoose.model('Community', CommunitySchema);

//rate communities
var includeRatingStats = function(community) {
  var sum = 0;

  _.each(community.ratings, function(rating) {
    if (rating.rating) {
      sum += 1;
    }
  });

  community.numLikes = sum;
};

// create community entity

exports.create = function(community, cb) {
  Community.create({
    name: community.name,
    members: community.members,
    ratings: community.ratings,
    date: new Date(),
    ownerId: community.ownerId,
    privacy:community.privacy
  }, cb);
};

// get community information

exports.get = function(id, cb) {
  Community.findOne({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else {
      community = community.toObject();
      cb(null, community);
    }
  });
};

exports.getUserCommunities = function(id, cb) {
  Community
  .find({'members': {$in : [id]}, 'privacy': 'Open'})
  .exec(function(err, communities) {
      if (err) {
        cb(err);
      } else {
        cb(null, communities);
      }
    });
};

//add self to the Community
exports.addMember = function(id, userId, cb) {
  Community.findById({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else if (community.members.indexOf(userId) !== -1) {
      cb (' User already a member of the community');
    } else if (community.privacy === 'Closed') {
      cb ('The community is \'invite-only\'');
    } else {
      community.members.push(userId);
      community.save(cb);
    }
  });
};

//Invite for Private (Closed) communities
exports.inviteMember = function(id, ownerId, userId, cb) {
  if (ownerId === userId) {
    return cb('Can\'t add owner to the community!');
  }
  Community.findOne({
    $and: [
      {_id: id},
      {members: {$in: [ownerId]}}
    ]
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Invalid community or user');
    } else if (community.members.indexOf(userId) !== -1) {
      cb (' User already a member of the community');
    } else {
      User.model
      .find({_id: userId})
      .exec(function(err, user) {
        /* istanbul ignore if: db errors are hard to unit test */
        if (err) {
          cb(err);
        } else if (!user) {
          cb('User is not valid');
        } else {
          community.members.push(userId);
          community.save(cb);
        }
      });
    }
  });
};

//remove member from  Community

exports.removeMember = function(id, userId, authId, cb) {
  Community.findById({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else if (authId.toString() === community.ownerId.toString()) {
      community.members.remove(userId);
      community.save(cb);
    } else if (authId.toString() === userId.toString()) {
      cb('Can\'t remove owner from community');
    } else {
      return cb('User not authorized');
    }
  });
};

// return top actions in community NOTE: this is a bit of a mess atm, maybe there's a better way?
exports.topActions = function(id, limit, cb) {
  // first find members of community
  Community
  .findOne({_id: id})
  .select('members')
  .exec(function(err, community) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else if (!community) {
      cb('community not found!');
    } else {
      // find actions of users that are part of the community
      User.model
      .find({_id: {$in: community.members}})
      .select('actions.inProgress actions.done')
      .exec(function(err, users) {
        /* istanbul ignore if: db errors are hard to unit test */
        if (err) {
          return cb(err);
        }

        // get counts for each action
        var actionCounts = {};
        _.each(users, function(user) {
          // combine inProgress and done actions
          var actions = _.extend(user.actions.inProgress, user.actions.done);
          _.each(actions, function(action, key) {
            actionCounts[key] = actionCounts[key] ? actionCounts[key] + 1 : 1;
          });
        });

        // finally get details of each action
        Action.model
        .find({_id: {$in: _.keys(actionCounts)}})
        .select('name description impact effort')
        .exec(function(err, actions) {
          /* istanbul ignore if: db errors are hard to unit test */
          if (err) {
            return cb(err);
          }

          _.each(actions, function(action, index) {
            actions[index] = action.toObject();
            actions[index].cnt = actionCounts[actions[index]._id];
          });

          actions = _.sortBy(actions, function(action) {
            return action.cnt * -1; // invert the order
          });

          actions.slice(0, limit || 10);

          cb(null, actions);
        });
      });
    }
  });
};

// delete community
exports.delete = function(id, cb) {
  Community.remove({
    _id: id
  }, cb);
};

exports.all = function(limit, skip, includeRatings, user, cb) {
  Community
  .find({})
  .skip(skip)
  .limit(limit)
  .exec(function(err, communities) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      // convert every returned community into a raw object (remove mongoose magic)
      for (var i = 0; i < communities.length; i++) {
        communities[i] = communities[i].toObject();
      }

      // calculate rating stats for each action
      _.each(communities, includeRatingStats);

      // include user's rating
      _.each(communities, function(community) {
        if (user && community.ratings[user._id]) {
          community.userRating = community.ratings[user._id].rating;
        }
      });

      // get rid of ratings
      if (!includeRatings) {
        _.each(communities, function(community) {
          community.ratings = undefined;
        });
      }
      cb(null, communities);
    }
  });
};

// Users can rate community
exports.rate = function(id, userId, rating, cb) {
  if (!userId) {
    return cb('Missing userId');
  }
  if (!_.isNumber(rating) || (rating !== 1 && rating !== 0)) {
    return cb('Missing/invalid rating');
  }
  Community.findOne({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else {
      community.ratings[userId._id] = {
        rating: rating,
        date: new Date()
      };
      community.markModified('ratings');
      community.save(function(err) {
        cb(err);
      });
    }
  });
};

// fetch energy data for entire community

exports.getAllHouseholds = function(id, cb) {
  Community.findOne({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else {
      //community = community.members.toObject();
      var tempArr = [];
      var members = community.members;
      async.each(members, function(obj, callback) {
          User.getProfile(obj, function(err, success) {
            if (err) {
              callback();
            } else {
              if (tempArr.indexOf(success.householdId)==-1) {
                tempArr.push(success.householdId);
              }
              callback();
            }
          });
        }, function(err) {
          if (err) {
            cb(err);
          } else {//filtering duplicate households from array
            var householdArr = tempArr.filter(function(elem, pos) {
              return tempArr.indexOf(elem) == pos;
            });
            cb(null, householdArr);
          }

      });
      
    }
  });
};

exports.consortium = function(households, from, to, resType, ctype, cb) {
  var usagepoints = [];
  var tempArr = [];
  async.each(households, function(obj, callback) {
          Household.getForConsortium(obj, function(err, success) {
            if (err || !success) {
              callback();
            } else {
              if (success.connected && tempArr.indexOf(success._usagePoint.apartmentId)==-1) {
                //console.log(success)
                tempArr.push(success._usagePoint.apartmentId);
                usagepoints.push({
                  householdId: obj,
                  usagePointId: success._usagePoint.apartmentId
                });
              }
              callback();
            }
          });
        }, function(err) {
          if (err) {
            cb(err);
          }
            //cb(null,usagepoints)
          var finalArr = [];  
          async.each(usagepoints, function(obj, callback) {
            Consumption.downloadMyData(obj.usagePointId, from, to, resType, ctype, function(err, conData) {
              if (err || !conData) {
              callback();
              } else {
                console.log(conData);
                finalArr.push({
                  refObject: obj,
                  consumptionData: conData
                });
                callback();
              }
            });

          }, function(err){
            if (err) {
              cb(err);
            } else {
              cb(null, finalArr);
            }
          });
      });
};

exports.model = Community;
