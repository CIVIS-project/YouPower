'use strict';

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

var conn = mongoose.connect('mongodb://localhost/youpower-tests');

var should = require('chai').should();
var models = require('../models');
var dummyData = require ('./dummyData');

describe('models', function() {
  describe('action', function() {
    var dbActions = [];

    beforeEach(function(done) {
      conn.connection.db.dropDatabase();

      async.map(dummyData.actions, function(action, cb) {
        models.action.create(action, cb);
      }, function(err, actions) {
        _.each(actions, function(action, i) {
          dbActions[i] = action;
        });
        done(err);
      });
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

    it('should add rating to action document', function(done) {
      var d = dummyData.ratings[0];

      // try rating an action that has not been rated yet
      models.action.rate(dbActions[1]._id, d.userId, d.rating, d.comment, function(err) {
        if (err) {
          return done(err);
        }

        models.action.get(dbActions[1]._id, function(err, action) {
          if (err) {
            return done(err);
          }

          var rating = action.ratings[0];
          rating.userId = rating.userId.toString();
          delete(rating._id);

          rating.should.deep.equal(d);
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
      conn.connection.db.dropDatabase();

      async.map(dummyData.users, function(user, cb) {
        models.user.register(user, user.password, cb);
      }, function(err, users) {
        _.each(users, function(user, i) {
          dbUsers[i] = user;
        });
        done(err);
      });
    });

    it('should return profile', function(done) {
      models.user.getProfile(dbUsers[0]._id, function(err, user) {
        user.email.should.equal(dbUsers[0].email);
        done(err);
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
});
