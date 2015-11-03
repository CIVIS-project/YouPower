'use strict';

var mongoose = require('mongoose');
var models = require('./models');
var defaults = require('./models/defaults');
var async = require('async');
var dbUrl = process.env.MONGO_URL || 'mongodb://localhost/youpower';
mongoose.connect(dbUrl);
var db = mongoose.connection;
var createIfNotExist = function(model, key, doc, cb) {
  // contstruct the query
  var q = {};
  q[key] = doc[key];

  // perform findOne on exported mongoose model, findOne function is then guaranteed to exist
  models[model].model.findOne(q).exec(function(err, result) {
    if (err) {
      // return error
      cb(err);
    } else if (!result) {
      // create model
      console.log('creating model ' + model + ': ' + JSON.stringify(doc));
      models[model].create(doc, cb);
    } else {
      // already exists, return doc from db
      console.log(model + ' model already exists: ' + JSON.stringify(doc));
      cb(null, result);
    }
  });
};

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  var defaultUserId = null;

  async.series([
      function(cb) {
        // default user who created all the other default models
        createIfNotExist('users', 'email', defaults.user, function(err, result) {
          // store the userId
          defaultUserId = result._id;
          cb(err);
        });
      }, function(cb) {
        // actions
        async.eachSeries(defaults.actions, function(action, eachCb) {
          action.authorId = defaultUserId;
          createIfNotExist('actions', 'name', action, function(err) {
            eachCb(err);
          });
        }, function(err) {
          cb(err);
        });
      }, function(cb) {
        // communities
        async.eachSeries(defaults.communities, function(community, eachCb) {
          community.authorId = defaultUserId;
          createIfNotExist('communities', 'name', community, function(err) {
            eachCb(err);
          });
        }, function(err) {
          cb(err);
        });
      }, function(cb) {
        // households
        async.eachSeries(defaults.households, function(household, eachCb) {
          household.authorId = defaultUserId;
          createIfNotExist('households', 'name', household, function(err) {
            eachCb(err);
          });
        }, function(err) {
          cb(err);
        });
      }, function(cb) {
        // testbeds
        async.eachSeries(defaults.testbeds, function(testbed, eachCb) {
          createIfNotExist('testbeds', 'name', testbed, function(err) {
            eachCb(err);
          });
        }, function(err) {
          cb(err);
        });
      }, function(cb) {
        // cooperatives
        async.eachSeries(defaults.cooperatives, function(cooperative, eachCb) {
          createIfNotExist('cooperatives', 'name', cooperative, function(err) {
            eachCb(err);
          });
        }, function(err) {
          cb(err);
        });
      }
  ], function(err) {
    if (err) {
      console.log('an error occurred! ' + err);
    }
    process.exit(err ? 1 : 0);
  });
});
