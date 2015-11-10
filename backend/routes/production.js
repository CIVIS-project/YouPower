'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');

/**
 * @api {get} /production/last Last reading of production data
 * @apiGroup Production
 *
 * @apiParam {String} userId
 * @apiParam {String} token
 *
 * @apiExample {curl} Example usage
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *    "userId": "dummy",
 *    "token": "dummy"
 *  }' \
 *  http://localhost:3000/api/production/last
 *
 * @apiSuccessExample {[json]} Success-Response:
 * {
 *   production: 0.9164172718301415,
 * }
 */
router.get('/last', auth.authenticate(), function(req, res) {
  res.successRes(null, Math.random());
});

module.exports = router;
