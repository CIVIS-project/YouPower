'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var escapeStringRegexp = require('escape-string-regexp');

var CooperativeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  actions: [{
    name: String,
    description: String,
    date: Date,
  }]
});

var Cooperative = mongoose.model('Cooperative', CooperativeSchema);

exports.create = function(cooperative, cb) {
  Cooperative.create({
    name: cooperative.name
  }, cb);
};

exports.get = function(id, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative) {
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      cooperative = cooperative.toObject();

      cb(null, cooperative);
    }
  });
};

exports.addAction = function(id, action, user, cb) {
  Cooperative.findOne({
    _id: id
  }, function(err, cooperative){
    if (err) {
      cb(err);
    } else if (!cooperative) {
      cb('Cooperative not found');
    } else {
      // cooperative = cooperative.toObject();
      if (!cooperative.actions){
        cooperative.actions = []
      }
      cooperative.actions.push(action);
      cooperative.markModified('actions');
      cooperative.save(function(err){
        cb(err,cooperative);
      })
      // cb(null, cooperative);
    }
  })
}

exports.model = Cooperative;
