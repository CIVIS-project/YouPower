'use strict';

var path = require('path');
var gm = require('gm');

exports.savePicture = function(stream, maxSize, imgPath, name, cb) {
  var picPath = path.join(imgPath, name + '.png');

  gm(stream)
  .size({bufferStream: true}, function(err, size) {
    if (err) {
      return cb(err);
    }

    maxSize = maxSize || 512;
    if (size.width > maxSize || size.height > maxSize) {
      this.resize(maxSize);
    }
    this.write(picPath, function(err) {
      cb(err);
    });
  });
};

exports.getUserHome = function() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};
