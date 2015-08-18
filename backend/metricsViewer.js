'use strict';

var _ = require('underscore');
var yargs = require('yargs').argv;
var colors = require('colors');
colors; // to make jshint happy

if (yargs.h) {
  console.log('Usage:');
  console.log('  -c   Colorize output');
  console.log('  -e   Ellipsize long lines (only show first row)');
  console.log('  -h   Show this help');
  process.exit(0);
}

var zeropad = function(number, length) {
  var str = '' + number;

  while (str.length < length) {
    str = '0' + str;
  }

  return str;
};

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/youpower');
var db = mongoose.connection;

var logs = require('./models/logs').model;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.error('connected to database');

  logs.find({})
  .sort('date')
  .exec(function(err, results) {
    if (err) {
      console.error(err);
    } else {
      _.each(results, function(line) {
        var category = line.category;
        var type = '[' + line.type + ']';
        var userId = String(line.userId);
        var data = JSON.stringify(line.data || '');

        var date = line.date.getFullYear() + '-' +
            zeropad(line.date.getMonth(), 2) + '-' +
            zeropad(line.date.getDate(), 2) + ' ' +
            zeropad(line.date.getHours(), 2) + ':' +
            zeropad(line.date.getMinutes(), 2) + ':' +
            zeropad(line.date.getSeconds(), 2) + ' ';

        var s = date + category + ' ' + type + ': ' + userId + ', ' + data;

        if (yargs.c) {
          // colors enabled
          var colored = date.magenta + category.green + ' ' + type.cyan + ': ' + userId.red;
          var coloredLen = String(date + category + ' ' + type + ': ' + userId).length;

          // first write out colored part
          process.stdout.write(colored);

          // then comes the rest of the data, ellpsized if needed
          if (yargs.e && s.length > process.stdout.columns) {
            process.stdout.write(s.substr(coloredLen, process.stdout.columns - coloredLen - 3));
            process.stdout.write('...');
          } else {
            process.stdout.write(s.substr(coloredLen));
          }
        } else {
          // colors disabled, ellipsize line if needed
          if (yargs.e && s.length > process.stdout.columns) {
            process.stdout.write(s.substr(0, process.stdout.columns - 3));
            process.stdout.write('...');
          } else {
            process.stdout.write(s);
          }
        }
        process.stdout.write('\n');
      });

      process.exit(0);
    }
  });
});
