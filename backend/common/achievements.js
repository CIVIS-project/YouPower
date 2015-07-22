'use strict';

exports.achievementList = {
  actionsDone: {
    name: 'Take action!',
    description: 'Complete %d action(s)',
    goals: [1, 3, 5, 10]
  },

  leavesSaved: {
    name: 'Save the trees',
    description: 'Save %d leaves',
    goals: [10, 20, 50, 75, 100, 150, 200, 300, 500, 1000]
  },

  communityLeaves: {
    name: 'Save together!',
    description: 'Join a community and save energy together! ' +
                 '(%d leaves saved in total by a community you participate in)',
    goals: [100, 250, 500, 1000, 3000, 10000]
  },

  actionsReviewed: {
    name: 'Judge',
    description: 'Help others choose great actions by reviewing %d YouPower action(s)',
    goals: [1, 2, 3]
  },

  reduceEnergy: {
    name: 'Environmentalist',
    description: 'Reduce your monthly energy use by %d %',
    goals: [5, 10, 15]
  },

  // unlocked by creating actions
  actionsCreated: {
    name: 'Advisor',
    description: 'Create %d action(s) and give others tips on how to save energy!',
    goals: [1, 2, 3]
  },

  myActionsCompleted: {
    name: 'Motivator',
    description: 'Have %d other YouPower user(s) complete an action created by you',
    completedMyActions: [1, 2, 3, 5, 10, 25, 50, 75, 100]
  },

  communitiesCreated: {
    name: 'Gathering',
    description: 'Create a community so you can save energy together with your friends!',
    goals: [1]
  },

  communityComments: {
    name: 'Discuss',
    description: 'Participate in community discussions by posting %d comment(s) to a community',
    goals: [1, 3, 5, 10]
  },

  betaTester: {
    name: 'Did it break yet?',
    description: 'Use YouPower in the beta testing phase',
    goals: [true]
  },

  dailyUser: {
    name: 'Daily user',
    description: 'Use the YouPower app every day for %d days',
    goals: [7]
  },

  achievementsUnlocked: {
    name: 'Completionist',
    description: 'Unlock %d % of all YouPower achievements',
    goals: [25, 50, 75, 90]
  }
};
