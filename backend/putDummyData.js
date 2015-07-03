'use strict';

var mongoose = require('mongoose');
var dummyData = require('test/dummyData');
var models = require('models');
var async = require('async');
var prompt = require('prompt');
var _ = require('underscore');
var dbUrl = process.env.MONGO_URL || 'mongodb://localhost/youpower';
var conn = mongoose.connect(dbUrl);
var db = mongoose.connection;

var resetModel = function(modelName, cb) {
  var resModels = [];
  conn.connection.db.dropCollection(modelName, function() {
    async.map(dummyData[modelName], function(model, cb) {
      models[modelName].create(model, cb);
    }, function(err, models) {
      _.each(models, function(model, i) {
        resModels[i] = model;
      });
      cb(err, resModels);
    });
  });
};

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to database');
  console.log('WARNING: this will DELETE the database at ' + dbUrl);
  console.log('and insert dummy data into the empty DB.');
  console.log('Are you sure you want to continue? (y/n): ');

  prompt.start();

  prompt.get(['answer'], function(err, result) {
    if (result.answer !== 'y') {
      console.log('aborting.');
      process.exit(1);
    }
    conn.connection.db.dropDatabase();
    async.each(_.keys(models), function(model, cb) {
      resetModel(model, function(err) {
        console.log(err ? err : model + ' added successfully');
        cb(err);
      });
    }, function(err) {
      console.log('finished ' + (err ? 'with error ' + err : 'without errors'));
      process.exit(err ? 1 : 0);
    });
  });
});
