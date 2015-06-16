'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Appliance Schema
var applianceSchema = new Schema(
  {
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
    type:[
      applianceSchema
    ]
  },
  energyVal:{
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

exports.getApartmentInfo = function(id, cb) {
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

exports.getByApartmentID = function(id, cb) {
  Household.findOne({
    apartmentID: id
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

exports.addAppliance = function(household, cb) {
  Household.findById({
  _id: household.id
}, function(err, house) {
  if (err) {
    cb(err);
  } else if (!house) {
    cb('Household not found');
  } else {
    house.appliancesList.push(household);
    cb(null, household);
  }
});
};

//remove appliance from household

exports.removeAppliance = function(household, cb) {
  Household.findById({
  _id: household.id
}, function(err, house) {
  if (err) {
    cb(err);
  } else if (!house) {
    cb('Household not found');
  } else {
    house.appliancesList.remove(household);
    cb(null, household);
  }
});
};

//add member to the household

exports.addMember = function(user, cb) {
  Household.findById({
  _id: user.id
}, function(err, house) {
  if (err) {
    cb(err);
  } else if (!house) {
    cb('Household not found');
  } else {
    house.members.push(user);
    cb(null, user);
  }
});
};

//remove member from  household

exports.removeMember = function(user, cb) {
  Household.findById({
  _id: user.id
}, function(err, house) {
  if (err) {
    cb(err);
  } else if (!house) {
    cb('Household not found');
  } else {
    house.members.remove(user);
    cb(null, user);
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
