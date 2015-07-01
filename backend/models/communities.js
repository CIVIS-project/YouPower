'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

var User = require('./users');
var Action = require('./actions');

//Community Schema
var CommunitySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  //refer challenge schema
  challenges: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true
    }
  ],
  // refer user schema
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
});

var Community = mongoose.model('Community', CommunitySchema);

// create community entity

exports.create = function(community, cb) {
  Community.create({
    name: community.name,
    challenges: community.challenges
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

//add member to the Community

exports.addMember = function(id, userId, cb) {
  Community.findById({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else {
      community.members.push(userId);
      community.save(cb);
    }
  });
};

//remove member from  Community

exports.removeMember = function(id, userId, cb) {
  Community.findById({
    _id: id
  }, function(err, community) {
    if (err) {
      cb(err);
    } else if (!community) {
      cb('Community not found');
    } else {
      community.members.remove(userId);
      community.save(cb);
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

exports.all = function(limit, skip, cb) {
  Community
  .find({})
  .skip(skip)
  .limit(limit)
  .select('name _id')
  .exec(function(err, communities) {
    cb(err, communities);
  });
};

exports.model = Community;
