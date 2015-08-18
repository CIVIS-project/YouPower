'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var _ = require('underscore');
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
    default: 'N/A'
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
    type: String
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  pendingInvites: {
    type: [
      Schema.Types.ObjectId
    ],
    default: []
  }
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
    ownerId: household.ownerId
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

// find user's household by userId
exports.getByUserId = function(userId, cb) {
  Household.findOne({
    $or: [
      {members: {$in: [userId]}},
      {ownerId: userId}
    ]
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb(null, null);
    } else {
      household = household.toObject();
      cb(null, household);
    }
  });
};
// invite userId to owner's household
exports.invite = function(ownerId, userId, cb) {
  if (ownerId === userId) {
    return cb('Can\'t add owner to their own household!');
  }
  Household.findOne({
    ownerId: ownerId
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household for user with id: ' + ownerId + ' not found!');
    } else {
      // check that user is not already invited
      if (household.pendingInvites.indexOf(userId) !== -1) {
        return cb('User has already been invited!');
      }

      if (household.members.indexOf(userId) !== -1) {
        return cb('User already belongs to household');
      }

      household.pendingInvites.push(userId);
      household.save(cb);
    }
  });
};

exports.findInvites = function(userId, cb) {
  Household.find({
    pendingInvites: {$in: [userId]}
  }, function(err, households) {
    if (err) {
      cb(err);
    } else if (!households) {
      cb(null, []);
    } else {
      var householdIds = [];
      _.each(households, function(household) {
        householdIds.push(household._id);
      });
      cb(null, householdIds);
    }
  });
};

// accept or deny a household invite
exports.handleInvite = function(householdId, userId, accepted, cb) {
  Household.findOne({
    _id: householdId
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found by id: ' + householdId + '!');
    } else {
      var index = household.pendingInvites.indexOf(userId);
      // check that user has indeed been invited
      if (index === -1) {
        return cb('Invitation to household not found!');
      }

      household.pendingInvites.splice(index, 1);
      household.members.push(userId);

      household.save(cb);
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
      // Increase family adults count by 1.
      household.familyComposition.NumAdults++;
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

// get household by user_id
exports.getHouseholdByUserId = function(id, cb) {
  Household.findOne({
    members: id
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

exports.model = Household;
