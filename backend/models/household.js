'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HouseSchema = new Schema({
  apartmentID: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  members: {
    User: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }

});

var Household = mongoose.model('Household', HouseSchema);

// create household with members

exports.create = function(household, cb) {
  Household.create({
    apartmentID: household.apartmentID,
    address: household.address,
    members:household.members // need to change
  }, cb);
};

// get household by id

exports.get = function(id, cb) {
  Household.findOne({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household = household.toObject();
      cb(null, household);
    }
  });
};

// find by apartmentID?

exports.getByApartmentID = function(apartmentID, cb) {
  Household.findOne({
    _id: apartmentID
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household = household.toObject();
      cb(null, household);
    }
  });
};

// delete houshold by id
exports.delete = function(id, cb) {
  Household.remove({
    _id: id
  }, cb);
};

var House = mongoose.model('Household', HouseSchema);

module.exports = {
  House: House
};
