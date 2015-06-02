'use strict';

var express = require('express');
var router = express.Router();

router.use('/consumption', require('./consumption'));
router.use('/user', require('./user'));
router.use('/action', require('./action'));
router.use('/challenge', require('./challenge'));
router.use('/auth', require('./auth'));
router.use('/household', require('./household'));

module.exports = router;
