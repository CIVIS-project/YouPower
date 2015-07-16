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
    category: 'repeating',
    activation: {
      configurable: true,
      repeat: 42,
      delay: 43
    },
    ratings: exports.ratings,
    description: 'dummy description',
    impact: 4,
    effort: 5
  },
  {
    _id: newId(),
    name: 'dummy name 2',
    category: 'oneshot',
    activation: {
      configurable: false
    },
    description: 'dummy description 2',
    impact: 2,
    effort: 1
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
    effort: 5
  }
];

exports.challenges = [
  {
    _id: newId(),
    name: 'dummy challenge name 1',
    description: 'dummy challenge description 1',
    actions: [exports.actions[0]._id],
    ratings: exports.ratings
  },
  {
    _id: newId(),
    name: 'dummy challenge name 2',
    description: 'dummy challenge description 2',
    actions: [exports.actions[1]._id]
  },
  {
    _id: newId(),
    name: 'dummy challenge name 3',
    description: 'dummy challenge description 3',
    actions: [exports.actions[0]._id, exports.actions[1]._id]
  }
];

exports.communities = [
  {
    _id: newId(),
    name: 'dummy community 1',
    challenges: [
      {
        id: exports.challenges[0]._id,
        name: exports.challenges[0].name
      },
      {
        id: exports.challenges[1]._id,
        name: exports.challenges[1].name
      },
      {
        id: exports.challenges[2]._id,
        name: exports.challenges[2].name
      }
    ],
    members: [
      exports.users[0]._id,
      exports.users[1]._id
    ],
    ratings: exports.ratings
  },
  {
    _id: newId(),
    name: 'dummy community 2',
    challenges: [
      {
        id: exports.challenges[2]._id,
        name: exports.challenges[2].name
      }
    ],
    members: [
      exports.users[1]._id
    ]
  }
];

exports.households = [
  {
    _id: newId(),
    apartmentId: 1234,
    address: 'my address',
    energyVal: '42',
    members: [
      exports.users[0]._id
    ]
  },
  {
    _id: newId(),
    apartmentId: 1235,
    address: 'my address 2',
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

exports.challengeComments = [
  {
    _id: newId(),
    challengeId: exports.challenges[0]._id,
    name: 'myUser1',
    email: 'dummy@mail.com',
    comment: 'Hello world!'
  },
  {
    _id: newId(),
    challengeId: exports.challenges[0]._id,
    name: 'myUser2',
    email: 'dummy2@mail.com',
    comment: 'Hello world again!'
  },
  {
    _id: newId(),
    challengeId: exports.challenges[1]._id,
    name: 'myUser3',
    email: 'dummy3@mail.com',
    comment: 'Another challenge'
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
