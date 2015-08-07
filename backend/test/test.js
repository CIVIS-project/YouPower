'use strict';

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

var conn = mongoose.connect(process.env.MONGO_TEST_URL || 'mongodb://localhost/youpower-tests');

var should = require('chai').should();
var models = require('../models');
var dummyData = require('./dummyData');

var resetModel = function(modelName, cb) {
  dummyData = require('./dummyData');
  var resDocs = [];
  conn.connection.db.dropCollection(modelName.toLowerCase(), function() {
    async.map(dummyData[modelName], function(model, cb) {
      models[modelName].create(model, cb);
    }, function(err, docs) {
      _.each(docs, function(doc, i) {
        resDocs[i] = doc;
      });

      //console.log('resetting model: ' + modelName);
      models[modelName].model.ensureIndexes(function(err) {
        cb(err, resDocs);
      });
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
      resetModel('actions', function(err, actions) {
        dbActions = actions;
        done(err);
      });
    });

    it('should return all actions without ratings', function(done) {
      models.actions.all(null, null, null, null, function(err, actions) {
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
      models.actions.all(null, null, true, null, function(err, actions) {
        actions.length.should.equal(dummyData.actions.length);
        var testAction = _.find(actions, function(action) {
          return action.name === dummyData.actions[0].name;
        });
        testAction.ratings[dummyData.users[0]._id]
        .should.deep.equal(dummyData.actions[0].ratings[dummyData.users[0]._id]);
        done(err);
      });
    });

    it('should return first action by id', function(done) {
      models.actions.get(dbActions[0]._id, null, function(err, action) {
        action.name.should.equal(dbActions[0].name);
        done(err);
      });
    });

    it('should return no action for bogus id', function(done) {
      models.actions.get(dummyData.ids[0], null, function(err) {
        done(err ? null : 'bogus action fetch did return an action!');
      });
    });

    it('should add rating to unrated action document', function(done) {
      var user = dummyData.users[0];
      var d = dummyData.actionRatings[user._id];
      var id = dbActions[0]._id;
      // try rating an action that has not been rated yet
      models.actions.rate(id, user, d.rating, d.effort, function(err) {
        if (err) {
          return done(err);
        }

        models.actions.get(id, null, function(err, action) {
          if (err) {
            return done(err);
          }

          var rating = action.ratings[user._id].rating;
          rating.should.equal(d.rating);
          done();
        });
      });
    });

    it('should update rating to action document', function(done) {
      var user = dummyData.users[0];
      var d = dummyData.actionRatings[user._id];
      var id = dbActions[0]._id;
      var newRating = 0;
      models.actions.rate(id, user, newRating, d.effort, function(err) {
        if (err) {
          return done(err);
        }
        models.actions.get(id, null, function(err, action) {
          if (err) {
            return done(err);
          }
          var rating = action.ratings[user._id].rating;
          rating.should.equal(newRating);
          done();
        });
      });
    });

    it('should refuse invalid ratings', function(done) {
      var user = dummyData.users[0];
      var d = dummyData.actionRatings[user._id];
      async.parallel([
        function(cb) {
          models.actions.rate(dummyData.ids[0], user, d.rating, d.effort, function(err) {
            cb(err ? null : 'passing bogus action id did not cause error!');
          });
        },
        function(cb) {
          models.actions.rate('foo bar', user, d.rating, d.effort, function(err) {
            cb(err ? null : 'passing invalid action id did not cause error!');
          });
        },
        function(cb) {
          models.actions.rate(dbActions[0]._id, null, d.rating, d.effort, function(err) {
            cb(err ? null : 'missing user parameter did not cause error!');
          });
        },
        function(cb) {
          models.actions.rate(dbActions[0]._id, user, null, d.effort, function(err) {
            cb(err ? null : 'missing rating field did not cause error!');
          });
        },
        function(cb) {
          models.actions.rate(dbActions[0]._id, user, d.rating, null, function(err) {
            cb(err ? null : 'missing effort field did not cause error!');
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('should delete action by id', function(done) {
      models.actions.delete(dbActions[0]._id, function() {
        models.actions.get(dbActions[0]._id, null, function(err) {
          done(err ? null : 'action was not deleted successfully');
        });
      });
    });

    it('should not create action with missing fields', function(done) {
      var d = dummyData.actions[0];
      async.parallel([
        function(cb) {
          models.actions.create({name: null, description: d.description}, function(err) {
            cb(err ? null : 'creating action with missing name did not cause error!');
          });
        },
        function(cb) {
          models.actions.create({name: d.name, description: null}, function(err) {
            cb(err ? null : 'creating action with missing description did not cause error!');
          });
        },
        function(cb) {
          models.actions.create({
            name: d.name,
            description: d.description,
            category: 'asdfsfsafcadrada'
          }, function(err) {
            cb(err ? null : 'creating action with bogus category did not cause error!');
          });
        },
        function(cb) {
          models.actions.create({
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
          models.actions.create({
            name: d.name,
            description: d.description,
            impact: 'foo bar'
          }, function(err) {
            cb(err ? null : 'creating action with bogus impact did not cause error!');
          });
        },
        function(cb) {
          models.actions.create({
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
    it('should return remaining actions as suggested actions', function(done) {
      var userActions = {};
      userActions.done = {};
      userActions.done[dbActions[0]._id] = {};
      models.actions.getSuggested(userActions, function(err, suggestedActions) {
        suggestedActions.length.should.equal(dbActions.length - 1);
        done(err);
      });
    });
    it('should not return any actions that the user has tried', function(done) {
      var userActions = {};
      userActions.done = {};
      userActions.inProgress = {};
      userActions.declined = {};
      userActions.done[dbActions[0]._id] = {};
      userActions.inProgress[dbActions[1]._id] = {};
      userActions.declined[dbActions[2]._id] = {};
      models.actions.getSuggested(userActions, function(err, suggestedActions) {
        suggestedActions.length.should.equal(dbActions.length - 3);
        done(err);
      });
    });

    it('should find actions by name', function(done) {
      models.actions.search('dummy name', function(err, actions) {
        // manually search dummy challenges for same string
        var d = [];
        _.each(dummyData.actions, function(action) {
          if (action.name.indexOf('dummy name') === 0) {
            d.push(action);
          }
        });
        actions.length.should.equal(d.length);
        done(err);
      });
    });
    it('should find actions by tag', function(done) {
      models.actions.search('daily', function(err, actions) {
        // manually search dummy challenges for same string
        var d = [];
        _.each(dummyData.actions, function(action) {
          if (action.tag === 'daily') {
            d.push(action);
          }
        });
        actions.length.should.equal(d.length);
        done(err);
      });
    });
    it('search should only match actions from start of string', function(done) {
      models.actions.search('ummy name', function(err, actions) {
        actions.length.should.equal(0);
        done(err);
      });
    });

  });

  describe('actionComments', function() {
    var dbActionComments = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset actions collection
      resetModel('actionComments', function(err, actionComments) {
        dbActionComments = actionComments;
        done(err);
      });
    });

    it('should get all dummy comments for first action', function(done) {
      var numFirstActionComments = _.filter(dummyData.actionComments, function(ac) {
        return ac.actionId === dummyData.actions[0]._id;
      }).length;

      models.actionComments.get(
          dummyData.actions[0]._id, null, null, null, function(err, actionComments) {
        actionComments.length.should.equal(numFirstActionComments);
        done(err);
      });
    });
    it('should return empty array for bogus actionId', function(done) {
      models.actionComments.get(dummyData.ids[0], null, null, null, function(err, actionComments) {
        actionComments.should.be.instanceof(Array).and.be.empty;
        done(err);
      });
    });
    it('should return error for invalid actionId', function(done) {
      models.actionComments.get('foo', null, null, null, function(err, actionComments) {
        should.not.exist(actionComments);
        done(err ? null : 'no error returned!');
      });
    });
    it('should create a comment', function(done) {
      var d = dummyData.actionComments[0];
      models.actionComments.create({
        actionId: d.actionId,
        name: 'foo bar',
        email: d.email,
        userId: d.userId,
        comment: 'foo baz'
      }, function(err, actionComment) {
        actionComment.name.should.equal('foo bar');
        actionComment.comment.should.equal('foo baz');
        done(err);
      });
    });
    it('should not create a comment with missing name', function(done) {
      var d = dummyData.actionComments[0];
      models.actionComments.create({
        actionId: d.actionId,
        name: null,
        email: d.email,
        comment: d.comment
      }, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should not create a comment with missing comment field', function(done) {
      var d = dummyData.actionComments[0];
      models.actionComments.create({
        actionId: d.actionId,
        name: d.name,
        email: d.email,
        comment: null
      }, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should delete a comment', function(done) {
      var d = dbActionComments[0];
      models.actionComments.delete(d.actionId, d._id, function(err, status) {
        status.result.n.should.equal(1);
        done(err);
      });
    });
    it('should set hasPictures field', function(done) {
      var d = dbActionComments[0];
      models.actionComments.setHasPicture(d._id, true, function(err) {
        done(err);
      });
    });
    it('should not set hasPictures field for bogus commentId', function(done) {
      models.actionComments.setHasPicture(dummyData.ids[0], true, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should not set hasPictures field for invalid commentId', function(done) {
      models.actionComments.setHasPicture('foo bar', true, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should add rating to unrated action comment', function(done) {
      var user = dummyData.users[0];
      var rating = 1;
      var id = dbActionComments[0]._id;
      var actionId = dummyData.actions[0]._id;

      // try rating an action that has not been rated yet
      models.actionComments.rate(actionId, id, user, rating, function(err) {
        if (err) {
          return done(err);
        }

        models.actionComments.get(actionId, null, null, null, function(err, aComments) {
          if (err) {
            return done(err);
          }

          var storedRating = _.find(aComments, function(aComment) {
            return String(aComment._id) === String(id);
          }).rating;

          storedRating.should.equal(rating);
          done();
        });
      });
    });

    it('should update rating to action document', function(done) {
      var user = dummyData.users[0];
      var id = dbActionComments[0]._id;
      var actionId = dummyData.actions[0]._id;

      models.actionComments.rate(actionId, id, user, 1, function(err) {
        if (err) {
          return done(err);
        }

        models.actionComments.rate(actionId, id, user, -1, function(err) {
          if (err) {
            return done(err);
          }
          models.actionComments.get(actionId, null, null, null, function(err, aComments) {
            if (err) {
              return done(err);
            }
            var storedRating = _.find(aComments, function(aComment) {
              return String(aComment._id) === String(id);
            }).rating;

            storedRating.should.equal(-1);
            done();
          });
        });
      });
    });

    it('should refuse invalid ratings', function(done) {
      var user = dummyData.users[0];
      var id = dbActionComments[0]._id;
      var actionId = dummyData.actions[0]._id;

      async.parallel([
        function(cb) {
          models.actionComments.rate(dummyData.ids[0], id, user, 1, function(err) {
            cb(err ? null : 'passing bogus action id did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate('foo bar', id, user, 1, function(err) {
            cb(err ? null : 'passing invalid action id did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate(actionId, dummyData.ids[0], null, 1, function(err) {
            cb(err ? null : 'passing bogus actionComment id did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate(actionId, 'foo bar', null, 1, function(err) {
            cb(err ? null : 'passing invalid actionComment id did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate(actionId, id, null, 1, function(err) {
            cb(err ? null : 'missing user parameter did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate(actionId, id, user, 2, function(err) {
            cb(err ? null : 'invalid rating did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate(actionId, id, user, -100, function(err) {
            cb(err ? null : 'invalid rating did not cause error!');
          });
        },
        function(cb) {
          models.actionComments.rate(actionId, id, user, null, function(err) {
            cb(err ? null : 'missing rating field did not cause error!');
          });
        }
      ], function(err) {
        done(err);
      });
    });
  });

  describe('user', function() {
    var dbUsers = [];
    var dbCommunities = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset challenges and user collections
      async.parallel([
        function(cb) {
          resetModel('communities', function(err, communities) {
            dbCommunities = communities;
            cb(err);
          });
        },
        function(cb) {
          resetModel('users', function(err, users) {
            dbUsers = users;
            cb(err);
          });
        }
      ], function(err) {
        done(err);
      });
      dummyData = require('./dummyData');
    });
    it('should return profile', function(done) {
      models.users.getProfile(dbUsers[0]._id, function(err, user) {
        user.email.should.equal(dbUsers[0].email);
        done(err);
      });
    });
    it('should return error when getting profile for invalid id', function(done) {
      models.users.getProfile('foo bar', function(err) {
        done(err ? null : 'no error returned!');
      });
    });

    it('should update profile correctly', function(done) {
      models.users.updateProfile(dbUsers[0], {
        name: 'new name'
      }, function(err) {
        if (err) {
          return done(err);
        }
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.profile.name.should.equal('new name');
          // TODO: date of birth?
          user.profile.photo.should.equal(dbUsers[0].profile.photo);
          done(err);
        });
      });
    });

    it('should update only photo url when only it is specified', function(done) {
      models.users.updateProfile(dbUsers[0], {
        photo: 'new url'
      }, function(err) {
        if (err) {
          return done(err);
        }
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.profile.name.should.equal(dbUsers[0].profile.name);
          user.profile.photo.should.equal('new url');
          // TODO: date of birth?
          done(err);
        });
      });
    });

    it('should return error for bogus profile query', function(done) {
      models.users.getProfile(dummyData.ids[0], function(err, user) {
        should.not.exist(user);
        done(err ? null : 'no error for bogus profile query!');
      });
    });

    it('should find user by query', function(done) {
      models.users.find({'email': dbUsers[0].email}, true, null, null, function(err, users) {
        users.length.should.equal(1);
        users[0].email.should.equal(dbUsers[0].email);
        users[0].profile.name.should.equal(dbUsers[0].profile.name);
        done(err);
      });
    });

    it('should return only one user', function(done) {
      models.users.find({'email': dbUsers[0].email}, false, null, null, function(err, user) {
        user.email.should.equal(dbUsers[0].email);
        user.profile.name.should.equal(dbUsers[0].profile.name);
        done(err);
      });
    });

    it('bogus query should return empty array for multi-find', function(done) {
      models.users.find({'email': 'dasfsada'}, true, null, null, function(err, users) {
        users.should.be.an.instanceof(Array);
        users.should.be.empty;
        done(err);
      });
    });

    it('bogus query should return undefined for non multi-find', function(done) {
      models.users.find({'email': 'dasfsada'}, false, null, null, function(err, user) {
        should.not.exist(user);
        done(err);
      });
    });

    it('should return the complete actions list for a user', function(done) {
      models.users.getUserActions(dbUsers[0]._id, 'all' , function(err, user) {
        //Is there a way to combine all of the action types?
        user.inProgress.should.deep.equal(dbUsers[0].actions.inProgress);
        user.done.should.deep.equal(dbUsers[0].actions.done);
        user.pending.should.deep.equal(dbUsers[0].actions.pending);
        user.declined.should.deep.equal(dbUsers[0].actions.declined);
        user.na.should.deep.equal(dbUsers[0].actions.na);
        done(err);
      });
    });

    it('should return only actions \'In Progress\'', function(done) {
      models.users.getUserActions(dbUsers[0]._id, 'progress' , function(err, user) {
        //Is there a way to combine all of the action types?
        user.should.deep.equal(dbUsers[0].actions.inProgress);
        done(err);
      });
    });

    it('should return only actions \'Declined / Canceled\'', function(done) {
      models.users.getUserActions(dbUsers[0]._id, 'declined' , function(err, user) {
        //Is there a way to combine all of the action types?
        user.should.deep.equal(dbUsers[0].actions.declined);
        done(err);
      });
    });

    it('should return only \'Pending\' actions' , function(done) {
      models.users.getUserActions(dbUsers[0]._id, 'pending' , function(err, user) {
        //Is there a way to combine all of the action types?
        user.should.deep.equal(dbUsers[0].actions.pending);
        done(err);
      });
    });

    it('should return only \'Done\' actions', function(done) {
      models.users.getUserActions(dbUsers[0]._id, 'done' , function(err, user) {
        //Is there a way to combine all of the action types?
        user.should.deep.equal(dbUsers[0].actions.done);
        done(err);
      });
    });

    it('should return only actions \'Not applicable\'', function(done) {
      models.users.getUserActions(dbUsers[0]._id, 'na' , function(err, user) {
        //Is there a way to combine all of the action types?
        user.should.deep.equal(dbUsers[0].actions.na);
        done(err);
      });
    });
  });

  describe('userAction', function() {
    var dbUsers = [];
    var dbActions = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset users and actions collections
      async.parallel([
        function(cb) {
          resetModel('users', function(err, users) {
            dbUsers = users;
            cb(err);
          });
        },
        function(cb) {
          resetModel('actions', function(err, actions) {
            dbActions = actions;
            cb(err);
          });
        }
      ], function(err) {
        done(err);
      });
    });
    it('should add action to user model', function(done) {
      models.users.setActionState(dbUsers[0], dbActions[0]._id, 'inProgress', null, function(err) {
        if (err) {
          return done(err);
        }
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.actions.inProgress[dbActions[0]._id].name.should.equal(dbActions[0].name);
          done(err);
        });
      });
    });

    it('should add multiple actions to user model', function(done) {
      async.parallel([
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id,
              'inProgress', null, cb);
        },
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[1]._id,
              'inProgress', null, cb);
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          user.actions.inProgress[dbActions[0]._id].name.should.equal(dbActions[0].name);
          user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
          done(err);
        });
      });
    });
    it('should remove same action from other action lists when adding', function(done) {
      // insert some actions into both done and declined
      dbUsers[0].actions.done[dbActions[0]._id] = dbActions[0];
      dbUsers[0].markModified('actions.done');
      dbUsers[0].actions.declined[dbActions[1]._id] = dbActions[1];
      dbUsers[0].markModified('actions.declined');
      dbUsers[0].save(function(err) {
        if (err) {
          return done(err);
        }
        async.parallel([
          function(cb) {
            models.users.setActionState(dbUsers[0], dbActions[0]._id,
                'inProgress', null, cb);
          },
          function(cb) {
            models.users.setActionState(dbUsers[0], dbActions[1]._id,
                'inProgress', null, cb);
          }
        ], function(err) {
          if (err) {
            return done(err);
          }
          models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
            user.actions.inProgress[dbActions[0]._id].name.should.equal(dbActions[0].name);
            user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
            should.not.exist(user.actions.done[dbActions[0]._id]);
            should.not.exist(user.actions.declined[dbActions[1]._id]);
            done(err);
          });
        });
      });
    });
    it('should return error when trying to add bogus action id', function(done) {
      models.users.setActionState(dbUsers[0], dummyData.ids[0], 'inProgress', null, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should return error when trying to add invalid action id', function(done) {
      models.users.setActionState(dbUsers[0], 'foo bar', 'inProgress', null, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should remove action from inProgress when canceling, add to declined', function(done) {
      async.series([
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id, 'inProgress', null, cb);
        },
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[1]._id, 'inProgress', null, cb);
        },
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id, 'declined', null, cb);
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          should.not.exist(user.actions.inProgress[dbActions[0]]);
          user.actions.declined[dbActions[0]._id].name.should.equal(dbActions[0].name);
          user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
          should.not.exist(user.actions.done[dbActions[0]._id]);
          should.not.exist(user.actions.declined[dbActions[1]._id]);
          done(err);
        });
      });
    });
    // this is probably not relevant anymore?
    xit('should return error if removing an action that has not been started', function(done) {
      var user = dbUsers[0];
      user.actions.done[dbActions[0]._id] = dbActions[0];
      user.markModified('actions.done');
      user.actions.declined[dbActions[1]._id] = dbActions[1];
      user.markModified('actions.declined');
      user.save(function(err) {
        if (err) {
          return done(err);
        }
        async.parallel([
          function(cb) {
            models.users.setActionState(user, dbActions[0]._id, 'declined', null, function(err) {
              cb(err ? null : 'completed action was declined without error!');
            });
          },
          function(cb) {
            models.users.setActionState(user, dbActions[1]._id, 'declined', null, function(err) {
              cb(err ? null : 'already declined action was declined without error!');
            });
          }
        ], function(err) {
          should.not.exist(user.actions.declined[dbActions[0]._id]);
          should.exist(user.actions.done[dbActions[0]._id]);
          should.exist(user.actions.declined[dbActions[1]._id]);
          done(err);
        });
      });
    });
    it('should return error when trying to cancel bogus action id', function(done) {
      models.users.setActionState(dbUsers[0], dummyData.ids[0], 'declined', null, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should mark action as complete, add to done', function(done) {
      async.series([
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id, 'inProgress', null, cb);
        },
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[1]._id, 'inProgress', null, cb);
        },
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id, 'done', null, cb);
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          should.not.exist(user.actions.inProgress[dbActions[0]]);
          user.actions.done[dbActions[0]._id].name.should.equal(dbActions[0].name);
          user.actions.inProgress[dbActions[1]._id].name.should.equal(dbActions[1].name);
          should.not.exist(user.actions.declined[dbActions[0]._id]);
          should.not.exist(user.actions.declined[dbActions[1]._id]);
          done(err);
        });
      });
    });
    // this is probably not relevant anymore?
    xit('should return error if completing an action that has not been started', function(done) {
      var user = dbUsers[0];
      user.actions.done[dbActions[0]._id] = dbActions[0];
      user.markModified('actions.done');
      user.actions.declined[dbActions[1]._id] = dbActions[1];
      user.markModified('actions.declined');
      user.save(function(err) {
        if (err) {
          return done(err);
        }
        async.parallel([
          function(cb) {
            models.users.setActionState(user, dbActions[0]._id, 'done', null, function(err) {
              cb(err ? null : 'already completed action was completed without error!');
            });
          },
          function(cb) {
            models.users.setActionState(user, dbActions[1]._id, 'done', null, function(err) {
              cb(err ? null : 'declined action was completed without error!');
            });
          }
        ], function(err) {
          should.not.exist(user.actions.done[dbActions[1]._id]);
          should.exist(user.actions.done[dbActions[0]._id]);
          user.actions.done[dbActions[0]._id].name.should.equal(dbActions[0].name);
          should.exist(user.actions.declined[dbActions[1]._id]);
          user.actions.declined[dbActions[1]._id].name.should.equal(dbActions[1].name);
          done(err);
        });
      });
    });
    it('should return error when trying to complete bogus action id', function(done) {
      models.users.setActionState(dbUsers[0], dummyData.ids[0], 'done', null, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should add pending action', function(done) {
      models.users.setActionState(dbUsers[0], dbActions[0]._id,
          'pending', new Date(42), done);
    });
    it('should not add pending action with missing/invalid postponed field', function(done) {
      async.parallel([
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id,
              'pending', null, function(err) {
            cb(err ? null : 'missing postponed field did not cause error!');
          });
        },
        function(cb) {
          models.users.setActionState(dbUsers[0], dbActions[0]._id,
              'pending', 'foo bar', function(err) {
            cb(err ? null : 'invalid postponed field did not cause error!');
          });
        }
      ], function(err) {
        done(err);
      });
    });
    it('should add alreadyDoing action', function(done) {
      models.users.setActionState(dbUsers[0], dbActions[0]._id,
          'alreadyDoing', null, function() {
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          should.exist(user.actions.done[dbActions[0]._id]);
          should.exist(user.actions.done[dbActions[0]._id].doneDate);
          user.actions.done[dbActions[0]._id].alreadyDoing.should.equal(true);
          done(err);
        });
      });
    });
    it('should add na action', function(done) {
      models.users.setActionState(dbUsers[0], dbActions[0]._id, 'na', null, function() {
        models.users.find({_id: dbUsers[0]._id}, false, null, null, function(err, user) {
          should.exist(user.actions.na[dbActions[0]._id]);
          done(err);
        });
      });
    });
    it('should not add action with invalid state', function(done) {
      models.users.setActionState(dbUsers[0], dbActions[0]._id, 'foo', null, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
  });

  describe('community', function() {
    var dbCommunities = [];
    var dbUsers = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset challenges and user collections
      async.parallel([
        function(cb) {
          resetModel('communities', function(err, communities) {
            dbCommunities = communities;
            cb(err);
          });
        },
        function(cb) {
          resetModel('users', function(err, users) {
            dbUsers = users;
            cb(err);
          });
        }
      ], function(err) {
        done(err);
      });
      dummyData = require('./dummyData');
    });

    it('should return all communities', function(done) {
      models.communities.all(null, null, true, null, function(err, communities) {
        communities.length.should.equal(2);
        done(err);
      });
    });
    it('should return only \'Open\' communities list for a user', function(done) {
      models.communities.getUserCommunities(dbUsers[0]._id, function(err, user) {
        user.length.should.equal(1);
        done(err);
      });
    });
    it('should not create community with missing name', function(done) {
      var d = dummyData.communities[0];
      models.communities.create({
        name: null,
        actions: d.actions
      }, function(err) {
        done(err ? null : 'creating community with missing name did not cause error!');
      });
    });
    it('should create community with empty challenges & actions', function(done) {
      models.communities.create({
        name: 'asdf'
      }, function(err) {
        done(err);
      });
    });

    it('should add rating to an unrated community document', function(done) {
      var user = dummyData.users[0];
      var d = dummyData.communityRatings[user._id];
      var id = dbCommunities[1]._id; // mustn't contain any ratings
      // try rating a community that has not been rated yet
      models.communities.rate(id, user, d.rating, function(err) {
        if (err) {
          return done(err);
        }

        models.communities.get(id, null, function(err, community) {
          if (err) {
            return done(err);
          }
          var rating = community.ratings[user._id].rating;
          rating.should.equal(d.rating);
          done();
        });
      });
    });

    it('should update rating of community', function(done) {
      var user = dummyData.users[0];
      var id = dbCommunities[0]._id;
      var newRating = 0;
      models.communities.rate(id, user, newRating, function(err) {
        if (err) {
          return done(err);
        }
        models.communities.get(id, null, function(err, community) {
          if (err) {
            return done(err);
          }
          var rating = community.ratings[user._id].rating;
          rating.should.equal(newRating);
          done();
        });
      });
    });

    it('should refuse invalid ratings', function(done) {
      var user = dummyData.users[0];
      var d = dummyData.communityRatings[user._id];
      async.parallel([
        function(cb) {
          models.communities.rate(dummyData.ids[0], user, d.rating, function(err) {
            cb(err ? null : 'passing bogus community id did not cause error!');
          });
        },
        function(cb) {
          models.communities.rate('foo bar', user, d.rating, function(err) {
            cb(err ? null : 'passing invalid community id did not cause error!');
          });
        },
        function(cb) {
          models.communities.rate(dbCommunities[0]._id, null, d.rating, function(err) {
            cb(err ? null : 'missing user id parameter did not cause error!');
          });
        },
        function(cb) {
          models.communities.rate(dbCommunities[0]._id, user, null, function(err) {
            cb(err ? null : 'missing rating field did not cause error!');
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('should return all communities without ratings', function(done) {
      models.communities.all(null, null, null, null, function(err, communities) {
        communities.length.should.equal(dummyData.communities.length);

        // find a community that was added with ratings
        var testCommunity = _.find(communities, function(community) {
          return community.name === dummyData.communities[0].name;
        });

        should.equal(testCommunity.ratings, undefined);
        done(err);
      });
    });

    it('should return all communities with ratings', function(done) {
      models.communities.all(null, null, true, null, function(err, communities) {
        communities.length.should.equal(dummyData.communities.length);
        var testCommunity = _.find(communities, function(community) {
          return community.name === dummyData.communities[0].name;
        });
        testCommunity.ratings[dummyData.users[0]._id]
        .should.deep.equal(dummyData.communities[0].ratings[dummyData.users[0]._id]);
        done(err);
      });
    });

    it('should return first community by id', function(done) {
      models.communities.get(dbCommunities[0]._id, null, function(err, community) {
        community.name.should.equal(dbCommunities[0].name);
        done(err);
      });
    });

    it('should return no community for bogus id', function(done) {
      models.communities.get(dummyData.ids[0], null, function(err) {
        done(err ? null : 'bogus community fetch did return a community!');
      });
    });

    it('should return no community for invalid id', function(done) {
      models.communities.get('foo bar', null, function(err) {
        done(err ? null : 'invalid community fetch did return a community!');
      });
    });

    it('should delete community by id', function(done) {
      models.communities.delete(dbCommunities[0]._id, function() {
        models.communities.get(dbCommunities[0]._id, null, function(err) {
          done(err ? null : 'community was not deleted successfully');
        });
      });
    });

    it('should add member to community', function(done) {
      // TODO: more thorough testing (add more than one member etc)
      models.communities.addMember(dbCommunities[0]._id, dbUsers[0]._id, function(err) {
        if (err) {
          return done(err);
        }
        models.communities.get(dbCommunities[0]._id, null, function(err, community) {
          community.members[0].toString().should.equal(dbUsers[0]._id.toString());
          done(err);
        });
      });
    });
    it('should return error when adding to bogus community id', function(done) {
      models.communities.addMember(dummyData.ids[0], dbUsers[0]._id, function(err) {
        done(err ? null : 'bogus community id member add did not return error!');
      });
    });
    it('should return error when adding to invalid community id', function(done) {
      models.communities.addMember('foo bar', dbUsers[0]._id, function(err) {
        done(err ? null : 'invalid community id member add did not return error!');
      });
    });

    it('should remove member from community', function(done) {
      // TODO: more thorough testing (remove more than one member etc)
      async.series([
        function(cb) {
          models.communities.addMember(dbCommunities[0]._id, dbUsers[1]._id, function(err) {
            cb(err);
          });
        },
        function(cb) {
          models.communities
          .removeMember(dbCommunities[0]._id, dbUsers[1]._id, dbUsers[0]._id, function(err) {
            cb(err);
          });
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.communities.get(dbCommunities[0]._id, null, function(err, community) {
          community.members[0].should.not.equal(dbUsers[0]._id);
          done(err);
        });
      });
    });
    it('should not allow non-owners to remove member from community', function(done) {
      // TODO: more thorough testing (remove more than one member etc)
      async.series([
        function(cb) {
          models.communities.addMember(dbCommunities[0]._id, dbUsers[1]._id, function(err) {
            cb(err);
          });
        },
        function(done) {
          models.communities
          .removeMember(dbCommunities[0]._id, dbUsers[0]._id, dbUsers[1]._id, function(err) {
            done(err ? null : 'unauthorized removal of member did not return error!');
          });
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.communities.get(dbCommunities[0]._id, null, function(err, community) {
          should.exist(community.members[0]);
          done(err);
        });
      });
    });
    it('should return error when removing from bogus community id', function(done) {
      models.communities
      .removeMember(dummyData.ids[0], dbUsers[1]._id, dbUsers[0]._id, function(err) {
        done(err ? null : 'bogus community id member remove did not return error!');
      });
    });
    it('should return error when removing from invalid community id', function(done) {
      models.communities.removeMember('foo bar', dbUsers[1]._id, dbUsers[0]._id, function(err) {
        done(err ? null : 'invalid community id member remove did not return error!');
      });
    });
    it('should return top actions in correct order', function(done) {
      resetModel('actions', function(err, actions) {
        var dbActions = actions;
        if (err) {
          return done(err);
        }

        async.parallel([
          // add users to community
          function(cb) {
            models.communities.addMember(dbCommunities[0]._id, dbUsers[0]._id, cb);
          },
          function(cb) {
            models.communities.addMember(dbCommunities[0]._id, dbUsers[1]._id, cb);
          },
          // add some actions to users
          function(cb) {
            models.users.setActionState(dbUsers[0], dbActions[0]._id, 'inProgress', null, cb);
          },
          function(cb) {
            models.users.setActionState(dbUsers[0], dbActions[1]._id, 'inProgress', null, cb);
          },
          function(cb) {
            models.users.setActionState(dbUsers[1], dbActions[1]._id, 'inProgress', null, cb);
          },
          function(cb) {
            models.users.setActionState(dbUsers[1], dbActions[2]._id, 'inProgress', null, cb);
          }
        ], function(err) {
          if (err) {
            return done(err);
          }
          models.communities.topActions(dbCommunities[0]._id, null, function(err, actions) {
            actions.length.should.equal(3);
            actions[0].name.should.equal(dummyData.actions[1].name);
            actions[1].name.should.not.equal(actions[2].name);
            done(err);
          });
        });
      });
    });
  });

  describe('communityComments', function() {
    var dbCommunityComments = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset communities collection
      resetModel('communityComments', function(err, communityComments) {
        dbCommunityComments = communityComments;
        done(err);
      });
    });

    it('should get all dummy comments for first community', function(done) {
      var numFirstCommunityComments = _.filter(dummyData.communityComments, function(ac) {
        return ac.communityId === dummyData.communities[0]._id;
      }).length;

      models.communityComments.get(
          dummyData.communities[0]._id, null, null, function(err, communityComments) {
        communityComments.length.should.equal(numFirstCommunityComments);
        done(err);
      });
    });
    it('should return error for bogus communityId', function(done) {
      models.communityComments.get(dummyData.ids[0], null, null, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should return error for invalid communityId', function(done) {
      models.communityComments.get('foo', null, null, function(err, communityComments) {
        should.not.exist(communityComments);
        done(err ? null : 'no error returned!');
      });
    });
    it('should create a comment', function(done) {
      var d = dummyData.communityComments[0];
      models.communityComments.create({
        communityId: d.communityId,
        name: 'foo bar',
        email: d.email,
        userId: d.userId,
        comment: 'foo baz'
      }, function(err, communityComment) {
        communityComment.name.should.equal('foo bar');
        communityComment.comment.should.equal('foo baz');
        done(err);
      });
    });
    it('should not create a comment with missing name', function(done) {
      var d = dummyData.communityComments[0];
      models.communityComments.create({
        communityId: d.communityId,
        name: null,
        email: d.email,
        comment: d.comment
      }, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should not create a comment with missing comment field', function(done) {
      var d = dummyData.communityComments[0];
      models.communityComments.create({
        communityId: d.communityId,
        name: d.name,
        email: d.email,
        comment: null
      }, function(err) {
        done(err ? null : 'no error returned!');
      });
    });
    it('should delete a comment', function(done) {
      var d = dbCommunityComments[0];
      models.communityComments.delete(d.communityId, d._id, function(err, status) {
        status.result.n.should.equal(1);
        done(err);
      });
    });
  });

  describe('household', function() {
    var dbHouseholds = [];
    var dbUsers = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset challenges and user collections
      async.parallel([
        function(cb) {
          resetModel('households', function(err, households) {
            dbHouseholds = households;
            cb(err);
          });
        },
        function(cb) {
          resetModel('users', function(err, users) {
            dbUsers = users;
            cb(err);
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('should not create household with missing fields', function(done) {
      var d = dummyData.households[0];
      async.parallel([
        function(cb) {
          models.households.create({
            address: d.address,
            energyVal: d.energyVal,
            members: d.members
          }, function(err) {
            cb(err ? null : 'missing apartmentId did not cause error!');
          });
        },
        function(cb) {
          models.households.create({
            apartmentId: d.apartmentId,
            energyVal: d.energyVal,
            members: d.members
          }, function(err) {
            cb(err ? null : 'missing address did not cause error!');
          });
        },
        function(cb) {
          models.households.create({
            apartmentId: d.apartmentId,
            address: d.address,
            members: d.members
          }, function(err) {
            cb(err ? null : 'missing energyVal did not cause error!');
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('should return first household by id', function(done) {
      models.households.get(dbHouseholds[0]._id, function(err, household) {
        household.apartmentId.should.equal(dbHouseholds[0].apartmentId);
        done(err);
      });
    });

    it('should return no household for bogus id', function(done) {
      models.households.get(dummyData.ids[0], function(err) {
        done(err ? null : 'bogus household fetch did return a household!');
      });
    });

    it('should return no household for invalid id', function(done) {
      models.households.get('foo bar', function(err) {
        done(err ? null : 'invalid household fetch did return a household!');
      });
    });

    it('should delete household by id', function(done) {
      models.households.delete(dbHouseholds[0]._id, function() {
        models.households.get(dbHouseholds[0]._id, function(err) {
          done(err ? null : 'household was not deleted successfully');
        });
      });
    });

    it('should add member to household', function(done) {
      // TODO: more thorough testing (add more than one member etc)
      models.households.addMember(dbHouseholds[0]._id, dbUsers[0]._id, function(err) {
        if (err) {
          return done(err);
        }
        models.households.get(dbHouseholds[0]._id, function(err, household) {
          household.members[0].toString().should.equal(dbUsers[0]._id.toString());
          done(err);
        });
      });
    });
    it('should return error when adding to bogus household id', function(done) {
      models.households.addMember(dummyData.ids[0], dbUsers[0]._id, function(err) {
        done(err ? null : 'bogus household id member add did not return error!');
      });
    });
    it('should return error when adding to invalid household id', function(done) {
      models.households.addMember('foo bar', dbUsers[0]._id, function(err) {
        done(err ? null : 'invalid household id member add did not return error!');
      });
    });

    it('should remove member from household', function(done) {
      // TODO: more thorough testing (remove more than one member etc)
      async.series([
        function(cb) {
          models.households.addMember(dbHouseholds[0]._id, dbUsers[0]._id, function(err) {
            cb(err);
          });
        },
        function(cb) {
          models.households.removeMember(dbHouseholds[0]._id, dbUsers[0]._id, function(err) {
            cb(err);
          });
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.households.get(dbHouseholds[0]._id, function(err, household) {
          should.not.exist(household.members[0]);
          done(err);
        });
      });
    });
    it('should return error when removing member from bogus household id', function(done) {
      models.households.removeMember(dummyData.ids[0], dbUsers[0]._id, function(err) {
        done(err ? null : 'bogus household id member remove did not return error!');
      });
    });
    it('should return error when removing member from invalid household id', function(done) {
      models.households.removeMember('foo bar', dbUsers[0]._id, function(err) {
        done(err ? null : 'invalid household id member remove did not return error!');
      });
    });

    it('should add appliance to household', function(done) {
      // TODO: more thorough testing (add more than one appliance etc)
      models.households.addAppliance(dbHouseholds[0]._id, dummyData.appliances[0], function(err) {
        if (err) {
          return done(err);
        }
        models.households.get(dbHouseholds[0]._id, function(err, household) {
          household.appliancesList[0].appliance.should.equal(dummyData.appliances[0].appliance);
          done(err);
        });
      });
    });
    it('should return error when adding appliance to bogus household id', function(done) {
      models.households.addAppliance(dummyData.ids[0], dummyData.appliances[0], function(err) {
        done(err ? null : 'bogus household id appliance add did not return error!');
      });
    });
    it('should return error when adding appliance to invalid household id', function(done) {
      models.households.addAppliance('foo bar', dummyData.appliances[0], function(err) {
        done(err ? null : 'invalid household id appliance add did not return error!');
      });
    });

    it('should remove appliance from household', function(done) {
      var d = dummyData.appliances[0];
      // TODO: more thorough testing (remove more than one appliance etc)
      async.series([
        function(cb) {
          models.households.addAppliance(dbHouseholds[0]._id, d, function(err) {
            cb(err);
          });
        },
        function(cb) {
          models.households.removeAppliance(dbHouseholds[0]._id, d._id, function(err) {
            cb(err);
          });
        }
      ], function(err) {
        if (err) {
          return done(err);
        }
        models.households.get(dbHouseholds[0]._id, function(err, household) {
          should.not.exist(household.appliancesList[0]);
          done(err);
        });
      });
    });
    it('should return error when removing appliance from bogus household id', function(done) {
      models.households.removeAppliance(dummyData.ids[0], dbUsers[0]._id, function(err) {
        done(err ? null : 'bogus household id appliance remove did not return error!');
      });
    });
    it('should return error when removing appliance from invalid household id', function(done) {
      models.households.removeAppliance('foo bar', dbUsers[0]._id, function(err) {
        done(err ? null : 'invalid household id appliance remove did not return error!');
      });
    });
    it('should update address', function(done) {
      models.households.updateAddress(dbHouseholds[0]._id, dbHouseholds[1].address,
       dbHouseholds[1].householdSize, dbHouseholds[1].householdType , function(err) {
        if (err) {
          return done(err);
        }
        models.households.get(dbHouseholds[0]._id, function(err, household) {
          household.address.should.equal(dbHouseholds[1].address);
          household.householdType.should.equal(dbHouseholds[1].householdType);
          household.householdSize.should.equal(dbHouseholds[1].householdSize);
          done(err);
        });
      });
    });
    it('should update misc household details', function(done) {
      models.households.updateHousehold(dbHouseholds[0]._id, dbHouseholds[1].familyComposition,
       dbHouseholds[1].householdSize, dbHouseholds[1].householdType , function(err) {
        if (err) {
          return done(err);
        }
        models.households.get(dbHouseholds[0]._id, function(err, household) {
          household.familyComposition.NumAdults
          .should.equal(dbHouseholds[1].familyComposition.NumAdults);
          household.familyComposition.NumKids
          .should.equal(dbHouseholds[1].familyComposition.NumKids);
          household.householdType.should.equal(dbHouseholds[1].householdType);
          household.householdSize.should.equal(dbHouseholds[1].householdSize);
          done(err);
        });
      });
    });
    it('should return household by apartment id', function(done) {
      models.households.getByApartmentId(dummyData.households[0].apartmentId,
      function(err, household) {
        household.address.should.equal(dummyData.households[0].address);
        done(err);
      });
    });
    it('should return error for bogus apartment id', function(done) {
      models.households.getByApartmentId(dummyData.ids[0],
      function(err) {
        done(err ? null : 'bogus apartment by id fetch did not error!');
      });
    });
    it('should return error for invalid apartment id', function(done) {
      models.households.getByApartmentId('foo bar',
      function(err) {
        done(err ? null : 'invalid id in apartment by id fetch did not error!');
      });
    });
  });

  describe('feedback', function() {
    var dbFeedback = [];

    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset feedback collection
      resetModel('feedback', function(err, feedback) {
        dbFeedback = feedback;
        done(err);
      });
    });

    it('should return all feedback', function(done) {
      models.feedback.all(null, null, function(err, feedback) {
        feedback.length.should.equal(dummyData.feedback.length);
        done(err);
      });
    });
  });

  describe('log', function() {
    // clear db before starting
    before(function() {
      conn.connection.db.dropDatabase();
    });

    beforeEach(function(done) {
      // reset logs collection
      resetModel('logs', function(err) {
        done(err);
      });
    });

    it('should refuse adding log entry with missing fields', function(done) {
      async.parallel([
        function(cb) {
          models.logs.create({
            userId: null,
            category: dummyData.logs[0].category,
            type: dummyData.logs[0].type,
            data: dummyData.logs[0].data
          }, function(err) {
            cb(err ? null : 'no error returned!');
          });
        }, function(cb) {
          models.logs.create({
            userId: dummyData.logs[0].userId,
            category: null,
            type: dummyData.logs[0].type,
            data: dummyData.logs[0].data
          }, function(err) {
            cb(err ? null : 'no error returned!');
          });
        },
        function(cb) {
          models.logs.create({
            userId: dummyData.logs[0].category,
            category: dummyData.logs[0].category,
            type: null,
            data: dummyData.logs[0].data
          }, function(err) {
            cb(err ? null : 'no error returned!');
          });
        }, function(cb) {
          models.logs.create({
            userId: dummyData.logs[0].category,
            category: dummyData.logs[0].category,
            type: dummyData.logs[0].type,
            data: null
          }, function(err) {
            cb(err ? null : 'no error returned!');
          });
        }
      ], function(err) {
        done(err);
      });
    });

    it('should return all logs', function(done) {
      models.logs.all(null, null, function(err, log) {
        log.length.should.equal(dummyData.logs.length);
        done(err);
      });
    });
  });

  /*describe('UsagePoint', function() {
    var dbUsagePoints = [];

    beforeEach(function(done) {
      resetModel('consumption', function(err, UsagePoint) {
        dbUsagePoints = UsagePoint;
        //console.log('VEFORE EACH USAGE POINTS', dbUsagePoints);
        done(err);
      });
    });

    it('should create a new UsagePoint', function(done) {
      var d = dummyData.consumption[0];
      models.consumption.create(d, function(err) {
        if (err) {
          done(err);
        } else {
          done(null, 'Dupilcate upsagepoint not created');
        }
      });
    });

  });*/
});
