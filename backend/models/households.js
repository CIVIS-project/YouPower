'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UsagePoint = require('./usagePoint');
var crypto = require('crypto');
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
  familyId: {
    type: String,
    ref: 'UsagePoint',
    unique: true,
    default: 'F0'
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
  // TODO: When do you update kids count?
  familyComposition : {
    NumAdults: {
      type: Number,
      default: 0
    },
    NumKids:  {
      type: Number,
      default: 0
    }},
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
  ],
  smartMeterStatus: {
    type: Boolean,
    default: false
  }
});

var Household = mongoose.model('Household', HouseSchema);

// create household entity
exports.create = function(household, cb) {
  var aptToken = crypto.randomBytes(8).toString('hex');
  Household.create({
    apartmentId: aptToken,
    familyId: household.familyId,
    address: household.address,
    householdType: household.householdType,
    householdSize: household.householdSize,
    familyComposition: household.familyComposition,
    appliancesList: household.appliancesList,
    energyVal: household.energyVal,
    smartMeterStatus: household.smartMeterStatus,
    members: household.members
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

//update household details like family composition, household size and type.
exports.updateHousehold = function(id, familyComposition, size, type, cb) {
  Household.findByIdAndUpdate(id, {
    $set : {
      familyComposition: familyComposition,
      householdSize: size,
      householdType: type
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

//Adds user to household with or without smart meter (replaces the previous 'add member' function)
//Checks apartment ID for household without smart meter
//Checks apartment ID & family ID for household with smart meter
exports.joinHouse = function(id, familyId, userId, cb) {
  Household.findOne({
    apartmentId: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else if (household.smartMeterStatus === 'true')  {
      Household.findOne({
        familyId: familyId
      }, function(err, family) {
        if (err) {
          cb(err);
        } else if (!family) {
          cb('Family ID not found');
        } else if (family.members.indexOf(userId) === -1) {
          family.members.push(userId);
          // Increase family adult count by 1.
          family.familyComposition.NumAdults++;
          family.save(cb);
        } else {
          cb('User already a member of the household');
        }
      });
    } else if (household.members.indexOf(userId) === -1) {
      household.members.push(userId);
      // Increase family adult count by 1.
      household.familyComposition.NumAdults++;
      household.save(cb);
    } else {
      cb('User already a member of the household');
    }
  });
};

//Connect to smart meter
exports.connect = function(id, familyId, cb) {
  Household.findOne({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      //set apartment ID from usagepoint to apartment ID of household
      UsagePoint.model
      .findOne({familyId: familyId})
      .exec(function(err, family) {
        if (err) {
          cb(err);
        } else if (!family) {
          cb('Family ID not found');
        } else {
          household.smartMeterStatus = 'true';
          household.apartmentId = family.apartmentId;
          household.familyId = family.familyId;
          household.save(cb);
        }
      });
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
