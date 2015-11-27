'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var User = require('../models').users;
var Household = require('../models').households;
var Cooperative = require('../models').cooperatives;

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


router.get('/users/smappee', auth.authenticate(), isAdmin, function(req,res){
  User.getSmappeeUsers(res.successRes);
})

router.get('/households', auth.authenticate(), isAdmin, function(req,res){
  Household.getAll(res.successRes);
})

router.post('/households/:id/meters',auth.authenticate(), isAdmin, function(req,res){
  Household.addMeter(req.params.id, req.body.id, req.body.type, req.body.source, res.successRes);
})

router.delete('/households/:id/meters/:meterId',auth.authenticate(), isAdmin, function(req,res){
  Household.removeMeter(req.params.id, req.params.meterId, res.successRes);
})

router.get('/cooperatives',auth.authenticate(), isAdmin, function(req,res){
  Cooperative.getAll(res.successRes);
})

router.post('/households/:id',auth.authenticate(), isAdmin, function(req,res){
  Household.update(req.params.id,req.body,res.successRes);
})


module.exports = router;
