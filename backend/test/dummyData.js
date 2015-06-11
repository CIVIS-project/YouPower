var mongoose = require('mongoose');
var newId = mongoose.Types.ObjectId;

exports.ids = [
  '5575283f4858ecc51b292d93',
  '5562c1d46b1083a13e5b7843'
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
    }
  },
  {
    _id: newId(),
    email: 'testUser2@foo.com',
    password: 'foobar2',
    profile: {
      name: 'my nick2',
      dob: new Date(43),
      photo: 'http://dummy2'
    }
  }
];

exports.ratings = [
  {
    _id: newId(),
    userId: exports.users[0]._id,
    rating: 4,
    comment: 'dummy rating comment'
  },
  {
    _id: newId(),
    userId: exports.users[1]._id,
    rating: 3,
    comment: 'another dummy rating comment'
  },
];

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
  }
];

exports.challenges = [
  {
    _id: newId(),
    name: 'dummy challenge name 1',
    description: 'dummy challenge description 1',
    actions: [exports.actions[0]._id],
    ratings: [exports.ratings[0]]
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
