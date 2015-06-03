exports.actions = [
  {
    name: 'dummy name',
    category: 'repeating',
    activation: {
      configurable: true,
      repeat: 42,
      delay: 43
    },
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
