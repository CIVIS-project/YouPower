'use strict';

exports.create = function(user, text, cb) {
  cb('12345');
};

exports.get = function(id, params, cb) {
  cb(null, {id:id, text: 'Authenticated example'});
};

exports.all = function(cb) {
  cb(null, []);
};

exports.allByUser = function(user, cb) {
  cb(null, []);
};
