'use strict';

var path = require('path');
var gm = require('gm');

exports.uploadPicture = function(stream, maxSize, imgPath, name, cb) {
  var fullPath = path.join(imgPath, name + '.png');

  gm(stream)
  .size({bufferStream: true}, function(err, size) {
    if (err) {
      return cb(err);
    }

    maxSize = maxSize || 512;
    if (size.width > maxSize || size.height > maxSize) {
      this.resize(maxSize);
    }
    this.write(fullPath, function(err) {
      cb(err, err ? {} : {msg: 'success!'});
    });
  });
};

exports.getUserHome = function() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};
