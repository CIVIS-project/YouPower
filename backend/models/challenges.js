'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var escapeStringRegexp = require('escape-string-regexp');

var ChallengeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // refer actions schema
  actions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Action',
      required: true
    }
  ],
  //ratings for challenges
  ratings: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

var Challenge = mongoose.model('Challenge', ChallengeSchema);

var includeRatingStats = function(challenge) {
  var cnt = 0;
  var sum = 0;

  _.each(challenge.ratings, function(rating) {
    sum += rating.rating;
    cnt++;
  });

  //Same logic as action's ratings
  challenge.avgRating = cnt ? sum / cnt : 0;
  challenge.numRatings = cnt;
};

//Create challenge
exports.create = function(challenge, cb) {
  Challenge.create({
    name: challenge.name,
    description: challenge.description,
    actions: challenge.actions,
    ratings: challenge.ratings || {}
  }, cb);
};

//Get challenge information with ratings
exports.get = function(id, cb) {
  Challenge.findOne({
    _id: id
  }, function(err, challenge) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else if (!challenge) {
      cb('Challenge not found');
    } else {
      challenge = challenge.toObject();
      includeRatingStats(challenge);
      cb(null, challenge);
    }
  });
};

//Search challenge by name
exports.search = function(cname, cb) {
  Challenge.find({
    name : new RegExp('^' + escapeStringRegexp(cname), 'i')
  }, function(err, challenges) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      cb(null, challenges);
    }
  });
};

//Delete a challenge with id
exports.delete = function(id, cb) {
  Challenge.remove({
    _id: id
  }, cb);
};

//Get a list of all challenges
exports.all = function(limit, skip, includeRatings, cb) {
  Challenge
  .find({})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(function(err, challenges) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else {
      // convert every returned challenges into a raw object (remove mongoose magic)
      for (var i = 0; i < challenges.length; i++) {
        challenges[i] = challenges[i].toObject();
      }

      // calculate rating stats for each challenges
      _.each(challenges, includeRatingStats);

      // get rid of ratings
      if (!includeRatings) {
        _.each(challenges, function(challenge) {
          challenge.ratings = undefined;
        });
      }
      cb(null, challenges);
    }
  });
};

exports.rate = function(id, userId, rating, comment, cb) {
  if (!userId) {
    return cb('Missing userId');
  }
  if (!rating || !_.isNumber(rating)) {
    return cb('Missing/invalid rating');
  }
  Challenge.findOne({
    _id: id
  }, function(err, challenge) {
    if (err) {
      cb(err);
    } else if (!challenge) {
      cb('Challenge not found');
    } else {
      challenge.ratings[userId] = {
        rating: rating,
        comment: comment || challenge.ratings[userId].comment,
        date: new Date()
      };
      challenge.markModified('ratings');
      challenge.save(function(err) {
        cb(err);
      });
    }
  });
};

exports.model = Challenge;
