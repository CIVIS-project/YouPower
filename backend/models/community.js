'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
  // refer actions schema
  actions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Action',
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
    challenges: community.challenges,
    actions: community.actions
  }, cb);
};

// get community information

exports.getCommunityInfo = function(id, cb) {
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

exports.addMember = function(user, cb) {
  Community.findById({
  _id: user.id
}, function(err, community) {
  if (err) {
    cb(err);
  } else if (!community) {
    cb('Community not found');
  } else {
    community.members.push(user);
    cb(null, user);
  }
});
};

//remove member from  Community

exports.removeMember = function(user, cb) {
  Community.findById({
  _id: user.id
}, function(err, community) {
  if (err) {
    cb(err);
  } else if (!community) {
    cb('Community not found');
  } else {
    community.members.remove(user);
    cb(null, user);
  }
});
};

// delete community
exports.delete = function(id, cb) {
  Community.remove({
    _id: id
  }, cb);
};

var Community = mongoose.model('Community', CommunitySchema);

module.exports = {
  Community: Community
};
