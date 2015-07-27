'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IntervalBlockSchema = new Schema({
	apartmentId: {
	  type: String,
	  required: true
	},
	_apartmentId: {
	  type: Schema.Types.ObjectId,
	  ref: 'UsagePoint',
	  required: true
	},
	type: String,
	kind: {
	  type: Number,
	  required: true
	}
});

var IntervalBlock = mongoose.model('IntervalBlock',IntervalBlockSchema);

exports.create = function(intervalBlock, _apartmentId, cb) {
	//console.log('TADA', intervalBlock, _apartmentId)
	IntervalBlock.create({
		apartmentId: intervalBlock.ApartmentID,
		_apartmentId: _apartmentId,
		type: intervalBlock.Type,
		kind: intervalBlock.ServiceCategory.kind,
	}, function(err, ib) {
		if (err) {
		  console.log("ERROR creating IB", err);
		  cb(err);
		}
		cb(null, ib);
	});
};

exports.model = IntervalBlock;
