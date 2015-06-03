'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;

var ActionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: 'oneshot reminder continuous repeating'.split(' '),
    default: 'oneshot'
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
    type: [
      {
        _id: {
          type: String, // userId of commenter
          required: true
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        comment: String
      }
    ],
    default: []
  }
});

var Action = mongoose.model('Action', ActionSchema);

var includeRatingStats = function(action) {
  var cnt = 0;
  var sum = 0;

  _.each(action.ratings, function(rating) {
    sum += rating.rating;
    cnt++;
  });

  action.avgRating = cnt ? sum / cnt : 0;
  action.numRatings = cnt;
};

exports.create = function(action, cb) {
  Action.create({
    name: action.name,
    category: action.category,
    activation: action.activation,
    description: action.description,
    impact: action.impact,
    effort: action.effort
  }, cb);
};

exports.get = function(id, cb) {
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
      cb(null, action);
    }
  });
};

exports.delete = function(id, cb) {
  Action.remove({
    _id: id
  }, cb);
};

exports.all = function(limit, skip, includeRatings, cb) {
  Action
  .find({})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, actions) {
    if (err) {
      cb(err);
    } else {
      // convert every returned action into a raw object (remove mongoose magic)
      for (var i = 0; i < actions.length; i++) {
        actions[i] = actions[i].toObject();
      }

      // calculate rating stats for each action
      _.each(actions, includeRatingStats);

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

exports.rate = function(id, userId, rating, comment, cb) {
  console.log(id, userId, rating, comment);
  Action.findOne({
    _id: id
  }, function(err, action) {
    if (err) {
      cb(err);
    } else if (!action) {
      cb('Action not found');
    } else {
      action.ratings.addToSet({
        _id: userId,
        rating: rating,
        comment: comment
      });

      action.save(function(err) {
        cb(err);
      });
    }
  });
};

/*
exports.allByUser = function(user, cb) {
  cb(null, []);
};
*/
