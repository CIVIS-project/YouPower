'use strict';
/**
Energy meteo API
*/
var http = require('http');
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var xml2js = require('xml2js');
var auth = require('../middleware/auth');
var parser = new xml2js.Parser({
    explicitArray:false
});

/**
 * @api {get} /api/energymeteo/tou Request a series of energy meteo levels
 * @apiGroup Energymeteo
 *
 * @apiParam {String} municipalityId  Test location(trentino users) Id, either storo or sanLorenzo
 * @apiParam {String} token
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "municipalityId":'storo',
 *  }'\
 *  http://localhost:3000/api/energymeteo/tou 
 *
 * @apiSuccessExample {json} Success-Response:
 *[
 *  {
 *      date: "2016-03-06 03:00:00",
 *      tarif: "Low"
 *  },
 *  {
 *      date: "2016-03-06 06:00:00",
 *      tarif: "High"
 *  }
 *]
 */

router.get('/tou', auth.authenticate(), function(request, response,next) {
	 var municipalityId = request.query.municipalityId;
 var options = {
                    host: '217.77.95.103',
                    path: '/api/tou/'+ municipalityId
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     // rejectUnauthorized : false,
                     // strictSSL: false
                };
             var requestcur = http.get(options, function (res) {
                    var data = [];
                     res.on("data", function(incomingDataCurrent) {
                        response.type('json').status('200').send(incomingDataCurrent);
                    }).on("error", function(){
                        response.sendStatus(500);
                    });                    
                });
             requestcur.setTimeout(3000, function() {
                // console.log("waiting under appliance id");
            });
            
});
/**
 * @api {get} /api/energymeteo/tou/current Request the current energy meteo level
* @apiGroup Energymeteo
 * @apiParam {String} municipalityId  Test location(trentino users) Id, either storo or sanLorenzo
 * @apiParam {String} token
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "municipalityId":'storo',
 *  }'\
 *  http://localhost:3000/api/energymeteo/tou/storo/current
 *
 * @apiSuccessExample {json} Success-Response:
 *[
 *  {
 *      tarif: "High"
 *  }
 *]
 */
router.get('/tou/current', auth.authenticate(), function(request, response, next) {
	 var municipalityId = request.query.municipalityId;
 var options = {
                    host: '217.77.95.103',
                    path: '/api/tou/'+ municipalityId + '/current'
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     // rejectUnauthorized : false,
                     // strictSSL: false
                };
         var requesttou = http.get(options, function (res) {
                    var data = [];
                     res.on("data", function(incomingDataCurrent) {
                        response.type('json').status('200').send(incomingDataCurrent);
                    }).on("error",function(){
                response.sendStatus(500);
             });                    
                });
          requesttou.setTimeout(3000, function() {
                // console.log("waiting under appliance id");
            });
             // request.end();

});

module.exports = router;

