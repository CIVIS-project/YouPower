'use strict';

//var config = require('../config');

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var usagePoint = require('./usagePoint');
var Consumption = require('./consumption');
var Cooperative = require('./cooperatives');
var async = require('async');
//Appliance Schema
var applianceSchema = new Schema({
  appliance: String,
  quantity: Number
});

var HouseSchema = new Schema({
  // apartmentId: {
  //   type: String,
  //   // required: true,
  //   unique: true
  // },
  apartmentId: String,
  /*'connected' Tells whether the house is connected to a UsagePoint
    If TRUE, _apartmentId gives the REAL apartmentId according to Energy meter UsagePoint
  */
  connected: {
    type: Boolean,
    default: false
  },
  _usagePoint: {
    type: Schema.Types.ObjectId,
    ref: 'UsagePoint',
    required: false
    //unique: true
  },
  address: {
    country: String,
    city: String,
    postalCode: String,
    street: String,
    default: {}
  },
  appliancesList: {
    type: [String],
    default: []
  },
  houseType : {
    type: String,
    enum : ['Apartment' , 'Town_house', 'Detached_house'],
  },
  ownership : {
    type: String,
    enum : ['Rental' , 'Owner'],
  },
  size : {
    type: Number
  },
  composition : {
    numAdults: {
      type: Number
    },
    numChildren:  {
      type: Number
    },
    default: {}
  },
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
  },
  meters: [{
    mType: String,
    meterId: String,
    source: String, // energimolnet, stored
  }],
  extraInfo: Schema.Types.Mixed
});

var Household = mongoose.model('Household', HouseSchema);

var HouseholdLookupSchema = new Schema({
  apartmentId: String,
  uniqueCode: {
    type: String,
    required: true,
    unique: true,
  }
});

var HouseholdLookup = mongoose.model('HouseholdLookup',HouseholdLookupSchema);

exports.lookup = HouseholdLookup;

// create household entity
exports.create = function(household, cb) {

  async.waterfall([function(cb){
    // Find household cooperative if any
    Cooperative.getProfile(household.cooperativeId, null, function(err, cooperative){
      if(err){
        console.log(err);
      }
      if(!err && cooperative){
        return cb(null, cooperative.toObject());
      }
      cb();
    })
  },function(cooperative, cb){
    // If we have household data, get the apartment ID from unique code (the lookup)
    if(cooperative && cooperative.hasHouseholdData){
      HouseholdLookup.findOne({uniqueCode:household.uniqueCode},function(err, lookupResult){
        if(err){
          console.log(err);
        } else {
          if(!lookupResult) {
            return cb('HOUSEHOLD_ID not found');
          }
          return cb(null, lookupResult.toObject());
        }
        cb();
      })
    } else {
      cb();
    }
  },function(lookupResult,cb){
    // If we have lookup results, find (if existing) matching household
    if(lookupResult) {
      Household.findOne({apartmentId:lookupResult.apartmentId},function(err, eHousehold){
        if(err){
          console.log(err);
        }
        cb(null, lookupResult, eHousehold);
      })
    } else {
      cb();
    }
  },function(lookupResult, eHousehold, cb){
    // If household already exists add the user to it
    if(eHousehold) {
      eHousehold.members.push(household.ownerId);
      if(household.extraInfo && household.extraInfo.smappee) {
        if(!eHousehold.extraInfo) {
          eHousehold.extraInfo = {};
        }
        eHousehold.extraInfo.smappee = household.extraInfo.smappee;
      }
      eHousehold.save(cb);
    } else {
      var newHousehold = {
        address: household.address,
        houseType: household.houseType,
        ownership: household.ownership,
        size: household.size,
        composition: household.composition,
        appliancesList: household.appliancesList,
        energyVal: household.energyVal,
        ownerId: household.ownerId,
        members: [household.ownerId],
        extraInfo: household.extraInfo
      }
      if(lookupResult) {
        newHousehold.apartmentId = lookupResult.apartmentId;
        newHousehold.connected = true;
        // FOR BRF Seglatsen
        newHousehold.meters = _.map(['electricity','hot_water'],function(type){
          return {
            mType: type,
            meterId:lookupResult.apartmentId,
            source: 'stored'
          }
        });
      }
      Household.create(newHousehold, cb);
    }
  }],cb);
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
      household.meters = _.map(household.meters,function(meter){return meter.mType});
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
        return cb('User already belongs to this household');
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

      if (accepted.toLowerCase()==="true") {
        //console.log('accepted?'+accepted);
        household.members.push(userId);
      }

      //console.log("household.members: "+JSON.stringify(household.members, null, 4));
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
      houseType: type,
      size: size
    }
  }, cb);
};

//update household details like family composition, household size and type.
exports.update = function(id, profile, cb) {
  // Household.findByIdAndUpdate(id, {
  //   $set : {
  //     composition: composition,
  //     size: size,
  //     houseType: type
  //   }
  // }, cb);

  Household.findById({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {

      if (profile.address) {
        household.address = profile.address;
      }

      if (profile.houseType) {
        household.houseType = profile.houseType;
      }

      if (profile.size) {
        household.size = profile.size;
      }

      if (profile.ownership) {
        household.ownership = profile.ownership;
      }

      if (profile.composition) {
        household.composition = profile.composition;
      }

      if (profile.appliancesList) {
        household.appliancesList = profile.appliancesList;
      }

      household.save(cb);
    }
  });

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
exports.removeAppliance = function(id, appliance, cb) {
  Household.findById({
    _id: id
  }, function(err, household) {
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household.appliancesList.pull({_id: appliance});
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

//Connect a household with energy data
// CHECKING if FAMILYID= to the given UsagePoint FamilyID secret is pending
exports.connectUsagePoint = function(usagepoint, cb) {
  usagePoint.getUsagePoint(usagepoint.apartmentId, function(err, up) {
    if (err) {
      cb(err);
    } else {
      Household.findOne({_usagePoint: up._id}, false, function(err, hh) {
        if (err) {
          cb(err);
        } else if (hh) {
          cb('Cannot connect, another household is connected to the UsagePoint');
        } else {
          exports.getByUserId(usagepoint.userId, function(err, household) {
            if (err) {
              cb(err);
            } else {
              Household.findByIdAndUpdate(household._id, {
                $set : {
                  _usagePoint: up._id,
                  connected: true
                }
              }, function(err, householdf) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, householdf);
                }
              });
            }
          });
        }
      });
    }
  });
};

// Stockholm case

exports.getConsumption = function(id, type, granularity, from, to, cb) {
  Household.findOne({
    _id: id
  }, function(err, household) {
    /* istanbul ignore if: db errors are hard to unit test */
    if (err) {
      cb(err);
    } else if (!household) {
      cb('Household not found');
    } else {
      household = household.toObject();
      var meter = _.findWhere(household.meters,{mType: type})
      if(meter) {
        switch(meter.source) {
          case 'stored':
            Consumption.getStoredConsumption(meter.meterId, type, granularity, from.split("-")[0], from.split("-")[1], cb);
            break;
          case 'energimolnet':
            meter.useInCalc = true;
            Consumption.getEnergimolnetConsumption([meter],type, granularity, from, to, cb);
            break;
          default:
            cb('Unknown meter source');
        }
      } else {
        cb('No ' + type + ' meter found for household');
      }
    }
  });
}

exports.bySmappee = function(cb) {
  Household.find({
    extraInfo: {
      smappee: true
    }
  },function(err,households){
    cb(err,households);
  });
}

exports.model = Household;
