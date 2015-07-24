'use strict';

var _ = require('underscore');
var util = require('util');

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

  communitiesJoined: {
    name: 'Be social!',
    description: 'Join %d communities(s)',
    goals: [1, 3, 5, 10]
  },

  actionsReviewed: {
    name: 'Expert',
    description: 'Help others choose great actions by reviewing %d YouPower action(s)',
    goals: [1, 2, 3]
  },

  reduceEnergy: {
    name: 'Environmentalist',
    description: 'Reduce your monthly energy use by %d %', // from average?
    goals: [5, 10, 15]
  },

  actionsCreated: {
    name: 'Advisor',
    description: 'Create %d action(s) and give others tips on how to save energy!',
    goals: [1, 2, 3]
  },

  myActionsCompleted: {
    name: 'Motivator',
    description: 'Have %d other YouPower user(s) complete an action created by you',
    goals: [1, 2, 3, 5, 10, 25, 50, 75, 100]
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
    goals: [1]
  },

  dailyUser: {
    name: 'Daily user',
    description: 'Use the YouPower app every day for %d days',
    goals: [3, 7]
  },

  achievementsUnlocked: {
    name: 'Completionist',
    description: 'Unlock %d % of all YouPower achievements',
    goals: [25, 50, 75, 90]
  }
};

exports.getStats = function(user) {
  var stats = {};

  _.each(exports.achievementList, function(achievement, aName) {
    var a = {};
    a.name = achievement.name;
    a.description = achievement.description;

    // get user achievement value, default to zero
    a.value = user.achievements[aName] ? user.achievements[aName].value : 0;
    a.achievedGoal = 0;
    a.nextGoal = null;

    _.each(achievement.goals, function(goal) {
      // find largest goal that we have achieved
      if (a.achievedGoal < goal && goal < a.value) {
        a.achievedGoal = goal;
      }
      // find smallest goal that is larger than what we have achieved
      if (goal > a.value && (goal < a.nextGoal || !a.nextGoal)) {
        a.nextGoal = goal;
      }
    });

    a.multi = achievement.goals.length === 1 ? false : true;

    // replace placeholder %d with next goal (or largest goal if all goals completed)
    if (a.description.indexOf('%d') !== -1) {
      var displayGoal = a.nextGoal || achievement.goals[achievement.goals.length - 1];
      a.description = util.format(a.description, displayGoal);
    }

    stats[aName] = a;
  });

  return stats;
};

// update achievement of aName
//
// takes a calcProgress function which decides how to set the new progress
// value
exports.updateAchievement = function(user, aName, calcProgress, cb) {
  var ua = user.achievements[aName] || {};

  // get new user achievement value from calcProgress by passing in old value
  ua.value = calcProgress(ua.value || 0);

  // save user model
  user.achievements[aName] = ua;
  cb = cb || _.noop;
  user.markModified('achievements');
  user.save(cb);
};
