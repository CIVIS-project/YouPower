'use strict';

var async = require('async');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var _ = require('underscore');

mockgoose(mongoose);
mongoose.connect('mongodb://dummy');

var should = require('chai').should();
var models = require('../models');
var dummyData = require ('./dummyData');

describe('models', function() {
  describe('action', function() {
    var dbActions = [];

    beforeEach(function(done) {
      mockgoose.reset();

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
});
