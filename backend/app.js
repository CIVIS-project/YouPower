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
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/civis');
var db = mongoose.connection;

var app = express();
app.set('mongoose', mongoose);

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./middlewares/auth').initialize());
app.use(require('./routes'));

db.on('error', l.error.bind(console, 'connection error:'));
db.once('open', function() {
  l.info('connected to database');
  app.listen(port, function() {
    l.info('express listening on port', port);
  });
});
