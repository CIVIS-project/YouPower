'use strict';

var _ = require('underscore');
var l = require('winston').loggers.get('default');

var getUserConfig = function() {
  var userConfig = {};

  try {
    userConfig = require(process.env.HOME + '/.youpower.json');
  } catch (e) {
    l.warn('could not find user config, using defaults');
  }

  return userConfig;
};

var defaultConfig = {
  //civisURL: 'http://civis.cloud.reply.eu/Civis/EnergyPlatform.svc'
  civisURL: 'http://civis.cloud.reply.eu/CivisEnergy'
};

module.exports = _.defaults(getUserConfig(), defaultConfig);
