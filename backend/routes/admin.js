'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var User = require('../models').users;

// router.all('/*', auth.authenticate(), function(req, res){
//   if(req.user.isAdmin){
//     next();
//   } else {
//     res.status(401).send("Not authorized");
//   }
// })

var isAdmin = function(req,res, next) {
  if(req.user && req.user.isAdmin){
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

router.get('/', auth.authenticate(), isAdmin, function(req,res){
  res.successRes(null, "Authorized");
})


router.get('/users/smappee',  function(req,res){
  User.getSmappeeUsers(res.successRes);
})

module.exports = router;
