exports.ids = [
  '5575283f4858ecc51b292d93',
  '5562c1d46b1083a13e5b7843'
];

exports.ratings = [
  {
    userId: exports.ids[0],
    rating: 4,
    comment: 'dummy rating comment'
  }
];

exports.actions = [
  {
    name: 'dummy name',
    category: 'repeating',
    activation: {
      configurable: true,
      repeat: 42,
      delay: 43
    },
    ratings: [
      {
        _id: '557533d7bd74ad513b057f24',
        comment: 'This tip is awesome!',
        rating: 4,
        userId: '557530ed6f3fece82d1b13ab'
      },
      {
        _id: '557533d7bd74ad513b057f25',
        comment: 'Another tip',
        rating: 3,
        userId: '557530ed6f3fece82d1b13ac'
      }
    ],
    description: 'dummy description',
    impact: 4,
    effort: 5
  },
  {
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

exports.users = [
  {
    email: 'testUser@foo.com',
    password: 'foobar1',
    profile: {
      name: 'my nick'
      // TODO: more fields
    }
  },
  {
    email: 'testUser2@foo.com',
    password: 'foobar2',
    profile: {
      name: 'my nick2'
      // TODO: more fields
    }
  }
];
