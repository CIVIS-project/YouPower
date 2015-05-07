'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers'));

app.listen(port, function() {
  console.log('Listening on port ' + port);
});
