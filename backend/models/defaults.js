'use strict';

// default data that can be used to get started from an empty db

exports.user = {
  email: 'civisuser@test.com',
  name: 'Default Test User',
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
