'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IntervalReadingSchema = new Schema({
	timePeriod: {
	  start: Date,
	  duration: Number,
	  datacoverage: Number
	},
	_intervalBlockId: {
	  type: Schema.Types.ObjectId,
	  ref: 'IntervalBlock',
	  required: true
	},
	value: {
	  type: String,
	  required: true
	},
	timeslot: {
	  type: String,
	  required: false
	}

});

var IntervalReading = mongoose.model('IntervalReading',IntervalReadingSchema);

exports.create = function(intervalReading, intervalBlock, cb) {
	console.log('TADA', intervalReading)
	IntervalReading.create({
		timePeriod: intervalReading.timePeriod,
		_intervalBlockId: intervalBlock,
		value: intervalReading['value'],
		timeslot: intervalReading.timeslot,
	}, function(err, ir) {
		if (err) {
		  console.log("ERROR creating IR", err);
		  cb(err);
		}
		cb(null, ir);
	});
};

exports.model = IntervalReading;
