'use strict';

var winston = require('winston');

winston.loggers.add('default', {
  console: {
    level: 'silly',
    colorize: true
  }
});

var l = winston.loggers.get('default');

var express = require('express');

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var fs = require('fs');

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/civis');
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
