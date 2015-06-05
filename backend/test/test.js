'use strict';

// this is to silence a warning about should never being used
/*jshint unused:false*/
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
    var firstAction = null;

    beforeEach(function(done) {
      mockgoose.reset();

      async.map(dummyData.actions, function(action, cb) {
        models.action.create(action, cb);
      }, function(err, actions) {
        firstAction = actions[0];
        done(err);
      });
    });

    it('should return all actions', function(done) {
      models.action.all(null, null, null, function(err, actions) {
        actions.length.should.equal(dummyData.actions.length);
        done(err);
      });
    });

    it('should return first action by id', function(done) {
      models.action.get(firstAction._id, function(err, action) {
        action.name.should.equal(firstAction.name);
        done(err);
      });
    });

    /*
    it('should add rating to action document', function(done) {
      models.action.rate(String(firstAction._id), 'myuser', 4, 'foo bar', function(err) {
        console.log(require('util').inspect(err));
        if (err) {
          return done(err);
        }
        models.action.get(firstAction._id, function(err, action) {
          console.log(action.ratings);
          done();
        });
      });
    });
    */
  });
});
