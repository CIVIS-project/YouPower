'use strict';
var mongoose = require('mongoose');
var newId = mongoose.Types.ObjectId;
// default data that can be used to get started from an empty db

exports.user = {
  _id: newId(),
  email: 'civisuser@test.com',
  name: 'Default Test User',
  token: '0',
  password: 'test'
};

exports.actions = [
  {
    name: 'Disable standby',
    description: 'Turn off and unplug standby power of TV, stereo, computer, etc.',
    impact: 2,
    effort: 2
  },
  {
    name: 'Leaks',
    description: 'Find and seal up leaks',
    impact: 3,
    effort: 4
  }
];

exports.communities = [
  {
    name: 'dummy community 1',
    members: [
      exports.user._id
    ],
    ownerId: exports.user._id,
    date:new Date()
  },
  {
    name: 'dummy community 2',
    members: [
      exports.user._id
    ],
    ownerId: exports.user._id,
    date:new Date()
  }
];

exports.households = [
  {
    apartmentId: 1234,
    address: 'my address',
    householdType: 'apartment',
    householdSize: '20m2',
    familyComposition: {
      NumAdults: 2,
      NumKids: 0
    },
    energyVal: '42',
    members: [
      exports.user._id
    ]
  },
  {
    apartmentId: 1235,
    address: 'my address 2',
    householdType: 'house',
    householdSize: '40m2',
    familyComposition: {
      NumAdults: 2,
      NumKids: 1
    },
    energyVal: '43',
    members: [
      exports.user._id
    ]
  }
];
