'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var User = require('./users');
var actionComments = require('./actionComments');
var escapeStringRegexp = require('escape-string-regexp');

var ActionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  tag: {
    type: String,
    enum: 'daily onetime high-effort repeating'.split(' '),
    default: 'daily'
  },
  activation: {
    configurable: {
      type: Boolean,
      default: false
    },
    repeat: Number,
    delay: Number
  },
  description: {
    type: String,
    required: true
  },
  impact: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  effort: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  ratings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  date: {
    type: Date,
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

var Action = mongoose.model('Action', ActionSchema);

var includeRatingStats = function(action) {
  var sum = 0;

  _.each(action.ratings, function(rating) {
    if (rating.rating) {
      sum += 1;
    }
  });

  action.numLikes = sum;
};

var includeMeanEffort = function(action) {
  var effortEstimates = [];

  // include initial effort estimate with larger weight
  for (var i = 0; i < 5; i++) {
    effortEstimates.push(action.effort);
  }

  _.each(action.ratings, function(rating) {
    if (rating.effort) {
      effortEstimates.push(rating.effort);
    }
  });

  action.effort = effortEstimates[parseInt(effortEstimates.length / 2)];
};

exports.create = function(action, cb) {
  Action.create({
    name: action.name,
    tag: action.tag,
    activation: action.activation,
    description: action.description,
    ratings: action.ratings || {},
    impact: action.impact,
    effort: action.effort,
    authorId: action.authorId,
    date: new Date()
  }, cb);
};

exports.get = function(id, user, cb) {
  Action.findOne({
    _id: id
  }, function(err, action) {
    if (err) {
      cb(err);
    } else if (!action) {
      cb('Action not found');
    } else {
      action = action.toObject();
      includeRatingStats(action);
      includeMeanEffort(action);

      // include user's rating
      if (user && action.ratings && action.ratings[user._id]) {
        action.userRating = action.ratings[user._id].rating;
      }

      // fetch number of comments to this action
      actionComments.get(id, null, null, null, function(err, aComments) {
        if (err) {
          return cb(err);
        }

        action.numComments = aComments.length;

        // fetch number of users doing this action
        var inProgressQuery = {};
        inProgressQuery['actions.inProgress.' + id] = {$exists: true};

        var doneQuery = {};
        doneQuery['actions.done.' + id] = {$exists: true};

        User.model.find({
          $or: [inProgressQuery, doneQuery]
        }, function(err, users) {
          if (err) {
            return cb(err);
          }

          action.numUsers = users.length;

          cb(null, action);
        });
      });
    }
  });
};

exports.delete = function(id, cb) {
  Action.remove({
    _id: id
  }, cb);
};

exports.all = function(limit, skip, includeRatings, user, cb) {
  Action
  .find({})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, actions) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      // convert every returned action into a raw object (remove mongoose magic)
      for (var i = 0; i < actions.length; i++) {
        actions[i] = actions[i].toObject();
      }

      // calculate rating & effort stats for each action
      _.each(actions, includeRatingStats);
      _.each(actions, includeMeanEffort);

      // include user's rating
      _.each(actions, function(action) {
        if (user && action.ratings && action.ratings[String(user._id)]) {
          action.userRating = action.ratings[String(user._id)].rating;
        }
      });

      // get rid of ratings
      if (!includeRatings) {
        _.each(actions, function(action) {
          action.ratings = undefined;
        });
      }
      cb(null, actions);
    }
  });
};

exports.rate = function(id, user, rating, effort, cb) {
  if (!user || !user._id || !user.profile || !user.profile.name) {
    return cb('Missing/invalid user');
  }

  //commented out by Yilin. This code 
  //make sure we're dealing with integers
  //rating = parseInt(rating);
  //effort = parseInt(effort);

  //console.log("rating: "+JSON.stringify(rating, null, 4));
  //console.log("effort: "+JSON.stringify(effort, null, 4));

  Action.findOne({
    _id: id
  }, function(err, action) {
    if (err) {
      cb(err);
    } else if (!action) {
      cb('Action not found');
    } else {
      var oldRating;
      var oldEffort;

      if (action.ratings[user._id]) {
        // rating already exists, store old values
        oldRating = action.ratings[user._id].rating;
        oldEffort = action.ratings[user._id].effort;

        // check that the values are sane
        if (_.isNumber(rating) && rating !== 1 && rating !== 0) {
          return cb('Invalid rating estimate');
        }
        if (effort < 1 || effort > 5) {
          return cb('Invalid effort estimate');
        }
      } else {
        // rating did not exist, require both a rating and effort estimate
        if (_.isNumber(rating) && (rating !== 1 && rating !== 0)) {
          return cb('Missing/invalid rating');
        }
        if (_.isNumber(effort) && (effort < 1 || effort > 5)) {
          return cb('Missing/invalid effort estimate');
        }
      }

      action.ratings[user._id] = {
        rating: _.isNumber(rating) ? parseInt(rating) : oldRating,
        effort: _.isNumber(effort) ? parseInt(effort) : oldEffort,
        name: user.profile.name,
        date: new Date()
      };
      action.markModified('ratings');
      action.save(function(err) {
        cb(err, action);
      });
    }
  });
};

exports.getSuggested = function(userActions, cb) {
  Action.find({
    $and: [
      {_id: {$nin: _.keys(userActions.done)}},
      {_id: {$nin: _.keys(userActions.declined)}},
      {_id: {$nin: _.keys(userActions.na)}},
      {_id: {$nin: _.keys(userActions.inProgress)}}
    ]
  })
  .sort('date')
  .limit(3)
  .select('name description impact effort')
  .exec(cb);
};

//Search action by name and tag attached to name
exports.search = function(aname, cb) {
  Action.find ({$or:[{'name': new RegExp('^' + escapeStringRegexp(aname), 'i')},
  {'tag' : new RegExp('^' + escapeStringRegexp(aname), 'i')}]},
   function(err, actions) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      cb(null, actions);
    }
  });
};

exports.model = Action;
