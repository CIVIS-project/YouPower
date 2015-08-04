'use strict';

var _ = require('underscore');
var util = require('util');

exports.achievementList = {
  actionsDone: {
    name: 'Take action!',
    description: 'Complete %d action(s)',
    goals: [1, 3, 5, 10]
  },

  // TODO: leaves are still WIP
  leavesSaved: {
    name: 'Save the trees',
    description: 'Save %d leaves',
    goals: [10, 20, 50, 75, 100, 150, 200, 300, 500, 1000]
  },

  // TODO: leaves are still WIP
  communityLeaves: {
    name: 'Save together!',
    description: 'Join a community and save energy together! ' +
                 '(%d leaves saved in total by a community you participate in)',
    goals: [100, 250, 500, 1000, 3000, 10000]
  },

  // TODO: getUserCommunities still WIP
  communitiesJoined: {
    name: 'Be social!',
    description: 'Join %d communities(s)',
    goals: [1, 3, 5, 10]
  },

  // TODO: count reviewed actions
  actionsReviewed: {
    name: 'Expert',
    description: 'Help others choose great actions by reviewing %d YouPower action(s)',
    goals: [1, 2, 3]
  },

  // TODO: energy data
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

  // TODO
  myActionsCompleted: {
    name: 'Motivator',
    description: 'Have %d other YouPower user(s) complete an action created by you',
    goals: [1, 2, 3, 5, 10, 25, 50, 75, 100]
  },

  // TODO
  communitiesCreated: {
    name: 'Gathering',
    description: 'Create a community so you can save energy together with your friends!',
    goals: [1]
  },

  // TODO
  communityComments: {
    name: 'Discuss',
    description: 'Participate in community discussions by posting %d comment(s) to a community',
    goals: [1, 3, 5, 10]
  },

  // TODO
  betaTester: {
    name: 'Did it break yet?',
    description: 'Use YouPower in the beta testing phase',
    goals: [1]
  },

  // TODO
  dailyUser: {
    name: 'Daily user',
    description: 'Use the YouPower app every day for %d days',
    goals: [3, 7]
  },

  // TODO
  achievementsUnlocked: {
    name: 'Completionist',
    description: 'Unlock %d % of all YouPower achievements',
    goals: [25, 50, 75, 90]
  },

  // TODO
  joinedHousehold: {
    name: 'Household',
    description: 'Be part of a household to track your energy and save with your family!',
    goals: [1]
  },

  // TODO: energy data
  energyData: {
    name: 'Energy tracker',
    description: 'Connect household with an energy data provider to track your energy',
    goals: [1]
  },
};

// get total number of achievements (including their sub-goals)
exports.totalAchievements = 0;
_.each(exports.achievementList, function(achievement) {
  exports.totalAchievements += achievement.goals.length;
});

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

  // check if the user has enough achievements to unlock next sub-goal of
  // 'achievementsUnlocked' achievement
  if (aName !== 'achievementsUnlocked') {
    var stats = exports.getStats(user);

    var unlockedAchievements = 0;
    // loop through every achievement
    _.each(stats, function(a) {
      // skip achievement if user hasn't achieved even the first sub-goal
      if (a.achievedGoal) {
        // loop through each sub-goal and add it if it's been achieved
        _.each(exports.achievementList[a.name].goals, function(goal) {
          if (goal <= a.value) {
            unlockedAchievements++;
          }
        });
      }
    });

    var totalA = user.achievements.achievementsUnlocked || {};
    totalA.value = Math.max(totalA.value || 0,
        unlockedAchievements / exports.totalAchievements * 100);

    user.achievements.achievementsUnlocked = totalA;
  }

  // save user model
  user.achievements[aName] = ua;
  cb = cb || _.noop;
  user.markModified('achievements');
  user.save(cb);
};
