'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RatingSchema = new Schema({
  username: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: String
});

var ActionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  impact: {
    type: Number,
    min: 1,
    max: 100,
    default: 10
  },
  effort: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  ratings: {
    type: [RatingSchema],
    default: []
  }
});

var Action = mongoose.model('Action', ActionSchema);

exports.create = function(name, impact, effort, cb) {
  Action.create({
    name: name,
    impact: impact,
    effort: effort
  }, cb);
};

exports.get = function(id, cb) {
  Action.findOne({
    _id: id
  }, cb);
};

exports.delete = function(id, cb) {
  Action.remove({
    _id: id
  }, cb);
};

exports.all = function(limit, skip, cb) {
  Action
  .find({})
  .sort({'date': -1})
  .skip(skip)
  .limit(limit)
  .exec(cb);
};

/*
exports.rate = function(id, user, rating, comment, cb) {
  Action.findOne({
    _id: id
  }, function(err, action) {
    if (err) {
      cb(err);
      return;
    }

    action.ratings.findOne({})
    .exec(function(err, rating) {
      console.log(err, rating);
    });
  });
};
*/

/*
// this functionality maybe belongs in user.js
exports.allByUser = function(user, cb) {
  cb(null, []);
};
*/
