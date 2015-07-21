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
  householdType : {
    type: String,
    enum : ['apartment' , 'house'],
  },
  householdSize : {
    type: String
  },
  familyComposition : {
    NumAdults: Number,
    NumKids: Number
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
    householdType: household.householdType,
    householdSize: household.householdSize,
    familyComposition: household.familyComposition,
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
    /* istanbul ignore if: db errors are hard to unit test */
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

//update address and in turn update apartment size and type.
exports.updateAddress = function(id, newAddress, size, type, cb) {
  Household.findByIdAndUpdate(id, {
    $set : {
      address: newAddress,
      householdType: type,
      householdSize: size
    }
  }, cb);
};

//add appliances to the household
exports.addAppliance = function(id, appliance, cb) {
  Household.findById({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household.appliancesList.push(appliance);
      household.save(cb);
    }
  });
};

//remove appliance from household
exports.removeAppliance = function(id, applianceId, cb) {
  Household.findById({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household.appliancesList.pull({_id: applianceId});
      household.save(cb);
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
      household.save(cb);
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
      household.save(cb);
    }
  });
};

// delete houshold by id
exports.delete = function(id, cb) {
  Household.remove({
    _id: id
  }, cb);
};

exports.model = Household;
