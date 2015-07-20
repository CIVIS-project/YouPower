'use strict';

var winston = require('winston');
winston.loggers.add('default', {
  console: {
    level: 'silly',
    colorize: true
  }
});

var l = winston.loggers.get('default');

if (process.env.NODE_ENV === 'test') {
  l.warn('========================= NOTICE ==========================');
  l.warn('running in test mode, this should NOT be used in production');
  l.warn('===========================================================\n');
}

// verify that graphicsmagick is installed
var which = require('which');
try {
  which.sync('gm');
} catch (e) {
  console.log(e);
  console.log('\nERROR: could not find graphicsmagick binary!');
  console.log('Please install graphicsmagick, for example on Ubuntu:');
  console.log('$ sudo apt-get install graphicsmagick');
  process.exit();
}

var express = require('express');

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

// make sure directories exist for picture uploads
var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
mkdirp(path.join(home, '.youpower', 'actionCommentPictures'));
mkdirp(path.join(home, '.youpower', 'actionPictures'));
mkdirp(path.join(home, '.youpower', 'profilePictures'));
mkdirp(path.join(home, '.youpower', 'communityPictures'));

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/youpower');
var db = mongoose.connection;
var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/apidoc');
app.use(function(req, res, next) {
  res.successRes = function(err, json, errStatus, okStatus) {
    errStatus = errStatus || 500;
    okStatus = okStatus || 200;
    res.status(err ? errStatus : okStatus).json(err || json);
  };
  next();
});

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw());
app.use(expressValidator());
app.use(require('./middleware/auth').initialize());
app.use('/api', require('./routes'));
app.get('/', function(req, res, next) {
  if (fs.existsSync(__dirname + '/apidoc/index.html')) {
    next();
  } else {
    res.render('placeholder');
  }
});
app.use(express.static(__dirname + '/apidoc'));

db.on('error', l.error.bind(console, 'connection error:'));
db.once('open', function() {
  l.info('connected to database');
  app.listen(port, function() {
    l.info('express listening on port', port);
  });
});
