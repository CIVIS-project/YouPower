'use strict';

var express = require('express');
var router = express.Router();

router.use('/consumption', require('./consumption'));
router.use('/production', require('./production'));
router.use('/user', require('./user'));
router.use('/action', require('./action'));
router.use('/challenge', require('./challenge'));
router.use('/feedback', require('./feedback'));
router.use('/auth', require('./auth'));
router.use('/household', require('./household'));
router.use('/community', require('./community'));
router.use('/cooperative', require('./cooperative'));
router.use('/testbed', require('./testbed'));

router.use('/admin',require('./admin'));

module.exports = router;
