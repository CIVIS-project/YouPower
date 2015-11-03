'use strict';
var mongoose = require('mongoose');
var newId = mongoose.Types.ObjectId;
// default data that can be used to get started from an empty db

exports.user = {
  _id: newId(),
  email: 'civisuser@test.com',
  profile: {
    name: 'Default Test User'
  },
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
    houseType: 'Apartment',
    size: 20,
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
    houseType: 'House',
    size: 40,
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

exports.testbeds = [
  {
    name: 'Stockholm - Fårdala'
  },
  {
    name: 'Stockholm - Hammarby Sjöstad'
  },
  {
    name: 'Trentino - Storo'
  },
  {
    name: 'Trentino - San Lorenzo in Banale'
  }
];

exports.cooperatives = [
  {
    name: 'Brf Grynnan',
    yearOfConst: 2004,
    area: 10974,
    noOfApart: 121,
    ventilationType: [ "FTX (mekanisk från- och tilluft med återvinning)", "F (mekanisk frånluftsventilation)"],
    lat: 59.303065,
    lng: 18.101027,
    meters: [{
      mType: 'heating',
      meterId: '56091c23b684f25e008b4769',
      useInCalc: true,
    },{
      mType: 'electricity',
      meterId: '56091d17aee3a861008b477f',
      useInCalc: true,
    },{
      mType: 'electricity',
      meterId: '56091d17aee3a861008b4780',
      useInCalc: false,
    },]
  },{
    name: 'Brf Hammarby Kanal',
    yearOfConst: 2001,
    area: 4889,
    noOfApart: 38,
    ventilationType: [ "F (mekanisk frånluftsventilation)"],
    lat: 59.303456,
    lng: 18.108517,
    meters: [
    ]
  },{
    name: 'Brf Seglatsen',
    yearOfConst: 2007,
    area: 15692,
    noOfApart: 137,
    ventilationType: [ "F (mekanisk frånluftsventilation)"],
    lat: 59.304689,
    lng: 18.090044,
    meters: [{
      mType: 'heating',
      meterId: '56091c5faee3a861008b4775',
      useInCalc: true,
    },{
      mType: 'electricity',
      meterId: '56091d47b684f25f008b47b1',
      useInCalc: true,
    },
    ]
  },{
    name: 'Brf Sickla Kanal',
    yearOfConst: 2002,
    area: 7706,
    noOfApart: 66,
    ventilationType: [ "FTX (mekanisk från- och tilluft med återvinning)", "F (mekanisk frånluftsventilation)"],
    lat: 59.303615,
    lng: 18.104175,
    meters: [{
      mType: 'heating',
      meterId: '56091c58aee3a861008b4774',
      useInCalc: true,
    },{
      mType: 'electricity',
      meterId: '56091d3aaee3a861008b4788',
      useInCalc: true,
    },{
      mType: 'electricity',
      meterId: '56091d3aaee3a861008b478a',
      useInCalc: true,
    },
    ]
  },{
    name: 'Brf Älven',
    yearOfConst: 2003,
    area: 8231,
    noOfApart: 69,
    ventilationType: [ "FVP (frånluftsvärmepump)"],
    lat: 59.303623,
    lng: 18.109971,
    meters: [{
      mType: 'heating',
      meterId: '56091c27aee3a860008b482b',
      useInCalc: true,
    },
    ]
  },

]

