'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Appliance Schema
var applianceSchema = new Schema({
  appliance: String,
  quantity: Number
});

var HouseSchema = new Schema({
  apartmentId: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  appliancesList: {
    type: [
      applianceSchema
    ],
    default: []
  },
  energyVal: {
    type: String,
    required: true
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ]
});

var Household = mongoose.model('Household', HouseSchema);

// create household entity
exports.create = function(household, cb) {
  Household.create({
    apartmentId: household.apartmentId,
    address: household.address,
    appliancesList: household.appliancesList,
    energyVal: household.energyVal,
    members: household.members // need to verify. not really correct
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

// find by apartmentId?
exports.getByApartmentId = function(id, cb) {
  Household.findOne({
    apartmentId: id
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

//update address
exports.updateAddress = function(household, cb) {
  Household.findByIdAndUpdate({
    _id: household.id
  }, function(err, house) {
    if (err) {
      cb(err);
    } else if (!house) {
      cb('Household not found');
    } else {
      house.address = household.address;
      cb(null, household);
    }
  });
};

//add appliances to the household
exports.addAppliance = function(household, appliance, cb) {
  Household.findById({
    _id: household.id
  }, function(err, house) {
    if (err) {
      cb(err);
    } else if (!house) {
      cb('Household not found');
    } else {
      house.appliancesList.push(appliance);
      cb(null, household);
    }
  });
};

//remove appliance from household
exports.removeAppliance = function(household, applianceId, cb) {
  Household.findById({
    _id: household.id
  }, function(err, house) {
    if (err) {
      cb(err);
    } else if (!house) {
      cb('Household not found');
    } else {
      house.appliancesList.pull({_id: applianceId});
      cb(null, household);
    }
  });
};

//add member to the household
exports.addMember = function(id, userId, cb) {
  Household.findById({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household.members.push(userId);
      cb(null, household);
    }
  });
};

//remove member from  household
exports.removeMember = function(id, userId, cb) {
  Household.findById({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household.members.remove(userId);
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

exports.House = Household;
