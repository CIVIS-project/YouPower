'use strict';

var express = require('express');
var router = express.Router();

router.use('/consumption', require('./consumption'));
router.use('/users', require('./users'));
router.use('/action', require('./action'));

module.exports = router;
