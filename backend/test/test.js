'use strict';

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

var conn = mongoose.connect('mongodb://localhost/youpower-tests');

var should = require('chai').should();
var models = require('../models');
var dummyData = require ('./dummyData');

var resetModel = function(modelName, cb) {
  var resModels = [];
  conn.connection.db.dropCollection(modelName + 's', function() {
    async.map(dummyData[modelName + 's'], function(model, cb) {
      models[modelName].create(model, cb);
    }, function(err, models) {
      _.each(models, function(model, i) {
        resModels[i] = model;
      });
      cb(err, resModels);
    });
  });
};

describe('models', function() {
  describe('action', function() {
    var dbActions = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset actions collection
      resetModel('action', function(err, actions) {
        dbActions = actions;
        done(err);
      });
      dummyData = require('./dummyData');
    });

    it('should return all actions without ratings', function(done) {
      models.action.all(null, null, null, function(err, actions) {
        actions.length.should.equal(dummyData.actions.length);

        // find an action that was added with ratings
        var testAction = _.find(actions, function(action) {
          return action.name === dummyData.actions[0].name;
        });

        should.equal(testAction.ratings, undefined);
        done(err);
      });
    });

    it('should return all actions with ratings', function(done) {
      models.action.all(null, null, true, function(err, actions) {
        actions.length.should.equal(dummyData.actions.length);

        var testAction = _.find(actions, function(action) {
          return action.name === dummyData.actions[0].name;
        });

        testAction.ratings[0].comment.should.equal(dummyData.actions[0].ratings[0].comment);
        done(err);
      });
    });

    it('should return first action by id', function(done) {
      models.action.get(dbActions[0]._id, function(err, action) {
        action.name.should.equal(dbActions[0].name);
        done(err);
      });
    });

    it('should return no action for bogus id', function(done) {
      models.action.get(dummyData.ids[0], function(err) {
        done(err ? null : 'bogus action fetch did return an action!');
      });
    });

    xit('should add rating to action document', function(done) {
      var d = dummyData.ratings[0];
      var id = dbActions[0]._id;
      console.log(id);
      // try rating an action that has not been rated yet
      models.action.rate(id, d.userId, d.rating, d.comment, function(err) {
        if (err) {
          return done(err);
        }

        models.action.get(id, function(err, action) {
          if (err) {
            return done(err);
          }

          var rating = action.ratings[0];
          _.omit(rating, ['_id']).should.deep.equal(_.omit(d, ['_id']));
          done();
        });
      });
    });

    it('should update rating to action document', function(done) {
      var d = dummyData.ratings[0];
      var id = dbActions[0]._id;
      d.rating = '2';
      models.action.updateRate(id, d.userId, d.rating, d.comment, function(err) {
        if (err) {
          return done(err);
        }
        models.action.get(id, function(err, action) {
          if (err) {
            return done(err);
          }
          var rating = action.ratings[0];
          console.log('After updation');
          console.log(rating.rating);
          _.omit(rating, ['_id']).should.deep.equal(_.omit(d, ['_id']));
          done();
        });
      });
    });

    it('should refuse invalid ratings', function(done) {
      var d = dummyData.ratings[0];
      async.parallel([
        function(cb) {
          models.action.rate(dummyData.ids[0], d.userId, d.rating, d.comment, function(err) {
            cb(err ? null : 'passing bogus action id did not cause error!');
          });
        },
        function(cb) {
          models.action.rate('foo bar', d.userId, d.rating, d.comment, function(err) {
            cb(err ? null : 'passing invalid action id did not cause error!');
          });
        },
        function(cb) {
          models.action.rate(dbActions[0]._id, null, d.rating, d.comment, function(err) {
            cb(err ? null : 'missing userId field did not cause error!');
          });
        },
        function(cb) {
          models.action.rate(dbActions[0]._id, d.userId, null, d.comment, function(err) {
            cb(err ? null : 'missing rating field did not cause error!');
          });
        },
        function(cb) {
          models.action.rate(dbActions[0]._id, d.userId, d.rating, null, function(err) {
            cb(err ? 'comment field should be optional but wasn\'t!' : null);
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('should delete action by id', function(done) {
      models.action.delete(dbActions[0]._id, function() {
        models.action.get(dbActions[0]._id, function(err) {
          done(err ? null : 'action was not deleted successfully');
        });
      });
    });

    it('should not create action with missing fields', function(done) {
      var d = dummyData.actions[0];
      async.parallel([
        function(cb) {
          models.action.create({name: null, description: d.description}, function(err) {
            cb(err ? null : 'creating action with missing name did not cause error!');
          });
        },
        function(cb) {
          models.action.create({name: d.name, description: null}, function(err) {
            cb(err ? null : 'creating action with missing description did not cause error!');
          });
        },
        function(cb) {
          models.action.create({
            name: d.name,
            description: d.description,
            category: 'asdfsfsafcadrada'
          }, function(err) {
            cb(err ? null : 'creating action with bogus category did not cause error!');
          });
        },
        function(cb) {
          models.action.create({
            name: d.name,
            description: d.description,
            activation: {
              repeat: 'three'
            }
          }, function(err) {
            cb(err ? null : 'creating action with bogus activation did not cause error!');
          });
        },
        function(cb) {
          models.action.create({
            name: d.name,
            description: d.description,
            impact: 'foo bar'
          }, function(err) {
            cb(err ? null : 'creating action with bogus impact did not cause error!');
          });
        },
        function(cb) {
          models.action.create({
            name: d.name,
            description: d.description,
            effort: 'foo bar'
          }, function(err) {
            cb(err ? null : 'creating action with bogus effort did not cause error!');
          });
        }
      ], function(err) {
        done(err);
      });
    });
  });

  describe('user', function() {
    var dbUsers = [];

    beforeEach(function(done) {
      // reset users collection
      resetModel('user', function(err, users) {
        dbUsers = users;
        done(err);
      });
      dummyData = require('./dummyData');
    });

    it('should return profile', function(done) {
      models.user.getProfile(dbUsers[0]._id, function(err, user) {
        user.email.should.equal(dbUsers[0].email);
        done(err);
      });
    });
    it('should return error when getting profile for invalid id', function(done) {
      models.user.getProfile('foo bar', function(err) {
        done(err ? null : 'no error returned!');
      });
    });

    it('should update profile correctly', function(done) {
      models.user.updateProfile(dbUsers[0], {
        name: 'new name'
      }, function(err) {
        if (err) {
          return done(err);
        }
        models.user.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.profile.name.should.equal('new name');
          // TODO: date of birth?
          user.profile.photo.should.equal(dbUsers[0].profile.photo);
          done(err);
        });
      });
    });

    it('should return error for bogus profile query', function(done) {
      models.user.getProfile(dummyData.ids[0], function(err, user) {
        should.not.exist(user);
        done(err ? null : 'no error for bogus profile query!');
      });
    });

    it('should find user by query', function(done) {
      models.user.find({'email': dbUsers[0].email}, true, null, null, function(err, users) {
        users.length.should.equal(1);
        users[0].email.should.equal(dbUsers[0].email);
        users[0].profile.name.should.equal(dbUsers[0].profile.name);
        done(err);
      });
    });

    it('should return only one user', function(done) {
      models.user.find({'email': dbUsers[0].email}, false, null, null, function(err, user) {
        user.email.should.equal(dbUsers[0].email);
        user.profile.name.should.equal(dbUsers[0].profile.name);
        done(err);
      });
    });

    it('bogus query should return empty array for multi-find', function(done) {
      models.user.find({'email': 'dasfsada'}, true, null, null, function(err, users) {
        users.should.be.an.instanceof(Array);
        users.should.be.empty;
        done(err);
      });
    });

    it('bogus query should return undefined for non multi-find', function(done) {
      models.user.find({'email': 'dasfsada'}, false, null, null, function(err, user) {
        should.not.exist(user);
        done(err);
      });
    });
  });

  describe('userAction', function() {
    var dbUsers = [];
    var dbActions = [];

    beforeEach(function(done) {
      // reset users and actions collections
      async.parallel([
        function(cb) {
          resetModel('user', function(err, users) {
            dbUsers = users;
            cb(err);
          });
        },
        function(cb) {
          resetModel('action', function(err, actions) {
            dbActions = actions;
            cb(err);
          });
        }
      ], function(err) {
        done(err);
      });
      dummyData = require('./dummyData');
    });
    it('should add action to user model', function(done) {
      models.user.startAction(dbUsers[0], dbActions[0]._id, function(err) {
        if (err) {
          return done(err);
        }
        models.user.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.actions.inProgress[dbActions[0]._id].name.should.equal(dbActions[0].name);
          done(err);
        });
      });
    });

    it('should add multiple actions to user model', function(done) {
      async.parallel([
        function(cb) {
          models.user.startAction(dbUsers[0], dbActions[0]._id, cb);
        },
        function(cb) {
          models.user.startAction(dbUsers[0], dbActions[1]._id, cb);
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.user.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.actions.inProgress[dbActions[0]._id].name.should.equal(dbActions[0].name);
          user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
          done(err);
        });
      });
    });
    it('should remove same action from other action lists when adding', function(done) {
      // insert some actions into both done and canceled
      dbUsers[0].actions.done[dbActions[0]._id] = dbActions[0];
      dbUsers[0].markModified('actions.done');
      dbUsers[0].actions.canceled[dbActions[1]._id] = dbActions[1];
      dbUsers[0].markModified('actions.canceled');
      dbUsers[0].save(function(err) {
        if (err) {
          return done(err);
        }
        async.parallel([
          function(cb) {
            models.user.startAction(dbUsers[0], dbActions[0]._id, cb);
          },
          function(cb) {
            models.user.startAction(dbUsers[0], dbActions[1]._id, cb);
          }
        ], function(err) {
          if (err) {
            return done(err);
          }
          models.user.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
            user.actions.inProgress[dbActions[0]._id].name.should.equal(dbActions[0].name);
            user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
            should.not.exist(user.actions.done[dbActions[0]._id]);
            should.not.exist(user.actions.canceled[dbActions[1]._id]);
            done(err);
          });
        });
      });
    });
    it('should return error when trying to add bogus action id', function(done) {
      models.user.startAction(dbUsers[0], dummyData.ids[0], function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should return error when trying to add invalid action id', function(done) {
      models.user.startAction(dbUsers[0], 'foo bar', function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should remove action from inProgress when canceling, add to canceled', function(done) {
      async.series([
        function(cb) {
          models.user.startAction(dbUsers[0], dbActions[0]._id, cb);
        },
        function(cb) {
          models.user.startAction(dbUsers[0], dbActions[1]._id, cb);
        },
        function(cb) {
          models.user.cancelAction(dbUsers[0], dbActions[0]._id, cb);
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.user.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          should.not.exist(user.actions.inProgress[dbActions[0]]);
          user.actions.canceled[dbActions[0]._id].name.should.equal(dbActions[0].name);
          user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
          should.not.exist(user.actions.done[dbActions[0]._id]);
          should.not.exist(user.actions.canceled[dbActions[1]._id]);
          done(err);
        });
      });
    });
    it('should return error if removing an action that has not been started', function(done) {
      var user = dbUsers[0];
      user.actions.done[dbActions[0]._id] = dbActions[0];
      user.markModified('actions.done');
      user.actions.canceled[dbActions[1]._id] = dbActions[1];
      user.markModified('actions.canceled');
      user.save(function(err) {
        if (err) {
          return done(err);
        }
        async.parallel([
          function(cb) {
            models.user.cancelAction(user, dbActions[0]._id, function(err) {
              cb(err ? null : 'completed action was canceled without error!');
            });
          },
          function(cb) {
            models.user.cancelAction(user, dbActions[1]._id, function(err) {
              cb(err ? null : 'already canceled action was canceled without error!');
            });
          }
        ], function(err) {
          should.not.exist(user.actions.canceled[dbActions[0]._id]);
          should.exist(user.actions.done[dbActions[0]._id]);
          should.exist(user.actions.canceled[dbActions[1]._id]);
          done(err);
        });
      });
    });
    it('should return error when trying to cancel bogus action id', function(done) {
      models.user.cancelAction(dbUsers[0], dummyData.ids[0], function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should mark action as complete, add to done', function(done) {
      async.series([
        function(cb) {
          models.user.startAction(dbUsers[0], dbActions[0]._id, cb);
        },
        function(cb) {
          models.user.startAction(dbUsers[0], dbActions[1]._id, cb);
        },
        function(cb) {
          models.user.completeAction(dbUsers[0], dbActions[0]._id, cb);
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.user.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          should.not.exist(user.actions.inProgress[dbActions[0]]);
          user.actions.done[dbActions[0]._id].name.should.equal(dbActions[0].name);
          user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
          should.not.exist(user.actions.canceled[dbActions[0]._id]);
          should.not.exist(user.actions.canceled[dbActions[1]._id]);
          done(err);
        });
      });
    });
    it('should return error if completing an action that has not been started', function(done) {
      var user = dbUsers[0];
      user.actions.done[dbActions[0]._id] = dbActions[0];
      user.markModified('actions.done');
      user.actions.canceled[dbActions[1]._id] = dbActions[1];
      user.markModified('actions.canceled');
      user.save(function(err) {
        if (err) {
          return done(err);
        }
        async.parallel([
          function(cb) {
            models.user.completeAction(user, dbActions[0]._id, function(err) {
              cb(err ? null : 'already completed action was completed without error!');
            });
          },
          function(cb) {
            models.user.completeAction(user, dbActions[1]._id, function(err) {
              cb(err ? null : 'canceled action was completed without error!');
            });
          }
        ], function(err) {
          should.not.exist(user.actions.done[dbActions[1]._id]);
          should.exist(user.actions.done[dbActions[0]._id]);
          user.actions.done[dbActions[0]._id].name.should.equal(dbActions[0].name);
          should.exist(user.actions.canceled[dbActions[1]._id]);
          user.actions.canceled[dbActions[1]._id].name.should.equal(dbActions[1].name);
          done(err);
        });
      });
    });
    it('should return error when trying to complete bogus action id', function(done) {
      models.user.completeAction(dbUsers[0], dummyData.ids[0], function(err) {
        done(err ? null : 'no error returned!');
      });
    });
  });

  describe('challenge', function() {
    var dbChallenges = [];
    var dbUsers = [];

    beforeEach(function(done) {
      // reset challenges and user collections
      async.parallel([
        function(cb) {
          resetModel('challenge', function(err, challenges) {
            dbChallenges = challenges;
            cb(err);
          });
        },
        function(cb) {
          resetModel('user', function(err, users) {
            dbUsers = users;
            cb(err);
          });
        }
      ], function(err) {
        done(err);
      });
    });
    it('should return all challenges without ratings', function(done) {
      models.challenge.all(null, null, null, function(err, challenges) {
        challenges.length.should.equal(dummyData.challenges.length);

        // find an challenge that was added with ratings
        var testChallenge = _.find(challenges, function(challenge) {
          return challenge.name === dummyData.challenges[0].name;
        });

        should.equal(testChallenge.ratings, undefined);
        done(err);
      });
    });

    it('should return all challenges with ratings', function(done) {
      models.challenge.all(null, null, true, function(err, challenges) {
        challenges.length.should.equal(dummyData.challenges.length);

        var testChallenge = _.find(challenges, function(challenge) {
          return challenge.name === dummyData.challenges[0].name;
        });

        testChallenge.ratings[0].comment.should.equal(dummyData.challenges[0].ratings[0].comment);
        done(err);
      });
    });
  });
});
