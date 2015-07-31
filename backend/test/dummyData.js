var mongoose = require('mongoose');
var newId = mongoose.Types.ObjectId;

exports.ids = [
  '5575283f4858ecc51b292d93',
  '5562c1d46b1083a13e5b7843'
];

exports.communityids = [
  '2574583f48522ec71b132493',
  '2574583f48522ec71b132494'
];

exports.users = [
  {
    _id: newId(),
    email: 'testUser@foo.com',
    password: 'foobar1',
    profile: {
      name: 'my nick',
      dob: new Date(42),
      photo: 'http://dummy'
    },

    communities: [
      exports.communityids[0]
    ]
  },
  {
    _id: newId(),
    email: 'testUser2@foo.com',
    password: 'foobar2',
    profile: {
      name: 'my nick2',
      dob: new Date(43),
      photo: 'http://dummy2'
    },
    communities: [
      exports.communityids[1]
    ]
  }
];

exports.ratings = {};
exports.ratings[exports.users[0]._id] = {
  rating: 4,
  comment: 'dummy rating comment'
};
exports.ratings[exports.users[1]._id] = {
  rating: 3,
  comment: 'another dummy rating comment'
};

exports.actions = [
  {
    _id: newId(),
    name: 'dummy name',
    tag: 'daily',
    activation: {
      configurable: true,
      repeat: 42,
      delay: 43
    },
    ratings: exports.ratings,
    description: 'dummy description',
    impact: 4,
    effort: 5,
    authorId: newId()
  },
  {
    _id: newId(),
    name: 'dummy name 2',
    tag: 'repeating',
    activation: {
      configurable: false
    },
    description: 'dummy description 2',
    impact: 2,
    effort: 1,
    authorId: newId()
  },
  {
    _id: newId(),
    name: 'dummy name 3',
    category: 'oneshot',
    activation: {
      configurable: false
    },
    description: 'dummy description 3',
    impact: 5,
    effort: 5,
    authorId: newId()
  }
];

exports.communities = [
  {
    _id: newId(),
    name: 'dummy community 1',
    members: [
      exports.users[0]._id
    ],
    ratings: exports.ratings,
    ownerId: exports.users[0]._id
  },
  {
    _id: newId(),
    name: 'dummy community 2',
    members: [
      exports.users[0]._id,
      exports.users[1]._id
    ],
    ownerId: exports.users[0]._id
  }
];

exports.households = [
  {
    _id: newId(),
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
      exports.users[0]._id
    ]
  },
  {
    _id: newId(),
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
      exports.users[1]._id
    ]
  }
];

exports.appliances = [
  {
    _id: newId(),
    appliance: 'dish washer',
    quantity: 1
  },
  {
    _id: newId(),
    appliance: 'tv',
    quantity: 2
  }
];

exports.actionComments = [
  {
    _id: newId(),
    actionId: exports.actions[0]._id,
    name: 'myUser1',
    email: 'dummy@mail.com',
    comment: 'Hello world!'
  },
  {
    _id: newId(),
    actionId: exports.actions[0]._id,
    name: 'myUser2',
    email: 'dummy2@mail.com',
    comment: 'Hello world again!'
  },
  {
    _id: newId(),
    actionId: exports.actions[1]._id,
    name: 'myUser3',
    email: 'dummy3@mail.com',
    comment: 'Another action'
  }
];

exports.communityComments = [
  {
    _id: newId(),
    communityId: exports.communities[0]._id,
    name: 'myUser1',
    email: 'dummy@mail.com',
    comment: 'Hello world!'
  },
  {
    _id: newId(),
    communityId: exports.communities[0]._id,
    name: 'myUser2',
    email: 'dummy2@mail.com',
    comment: 'Hello world again!'
  },
  {
    _id: newId(),
    communityId: exports.communities[1]._id,
    name: 'myUser3',
    email: 'dummy3@mail.com',
    comment: 'Another community'
  }
];

exports.feedback = [
  {
    _id: newId(),
    name: 'My Name',
    email: 'my@email.com',
    comment: 'Hello world!'
  },
  {
    _id: newId(),
    name: 'My Other Name',
    email: 'myother@email.com',
    comment: 'Hello other world!'
  }
];

exports.logs = [
  {
    _id: newId(),
    userId: newId(),
    category: 'dummyCategory',
    type: 'dummyType',
    data: {
      hello: 'world'
    },
    date: new Date(42)
  },
  {
    _id: newId(),
    userId: newId(),
    category: 'dummyCategory2',
    type: 'dummyType2',
    data: {
      hello: 'world2'
    },
    date: new Date(43)
  }
];

exports.usagepoints = [
  {
    _id: newId(),
    apartmentId: '1'
  },
  {
    _id: newId(),
    apartmentId: '2'
  },
  {
    _id: newId(),
    apartmentId: '3'
  }
];

exports.consumption = [
  {
    ApartmentID:'1',
    sensors: {
      sensor: [
        {
          sensorNumber:'0',
          sensorType:'0',
          measureUnit:'Wh',
          label:'Consumo Elettrico',
          lastSampleTimestamp:'2015-07-10T17:42:11+02:00'
        },
        {
          sensorNumber:'1',
          sensorType:'1',
          measureUnit:'Wh',
          label:'Freezer',
          lastSampleTimestamp:'2015-07-10T17:45:23+02:00'
        }
      ]
    }
  },
  {
    ApartmentID:'2',
    sensors: {
      sensor: [
        {
          sensorNumber:'5',
          sensorType:'0',
          measureUnit:'Wh',
          label:'Consumo Elettrico',
          lastSampleTimestamp:'2015-07-10T17:42:11+02:00'
        },
        {
          sensorNumber:'6',
          sensorType:'1',
          measureUnit:'Wh',
          label:'Freezer',
          lastSampleTimestamp:'2015-07-10T17:45:23+02:00'
        }
      ]
    }
  }
];
