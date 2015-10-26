'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testbedsSchema = new Schema({
  name: {
    type: String
  }
});

var Testbed = mongoose.model('Testbed', testbedsSchema);

exports.create = function(testbed, cb) {
  Testbed.create(testbed, function(err, t) {
    if (err) {
      cb (err);
    } else {
      t.save();
      cb(null, t);
    }
  });
};

exports.get = function(id, cb) {
  Testbed.find({_id: id}, false, cb);
};

exports.model = Testbed;
