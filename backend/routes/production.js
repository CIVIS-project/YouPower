/**
 * PRODUCTION API
 *
 */

var TYPE = 'S_PROD';

var dateFormat = require('dateformat');
var https = require('https');
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var xml2js = require('xml2js');
var apart = require('../models/apartment.js');
var auth = require('../middleware/auth');
var trentinoLogs = require('../models').trentinoLogs;

var parser = new xml2js.Parser({
    explicitArray:false
});


/**
 * @api {get} /api/production Request a time series of production data
 * @apiGroup Production
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 * @apiParam {Date} from
 * @apiParam {Date} to
 * @apiParam {String} res=DAILY resolution (RAW,HOURLY,DAILY,WEEKLY,MONTHLY)
 *
 *  *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *      "from":2015-10-10,
 *      "to":2015-10-11
 *  }'\
 *  http://localhost:3000/api/production
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *    {
 *      "date": "2015-10-10T00:00:00+02:00",
 *      "production": 4864.516356505453
 *    },
 *    {
 *      "date": "2015-10-11T00:00:00+02:00",
 *      "production": 4693.38304686174
 *    }
 * ]
 */
router.get('/',auth.authenticate(),function(request,response,next){
    var userid = request.query.userid;
    var from = request.query.from;
    var to = request.query.to;
    var res = request.query.res || 'DAILY';
    if(userid !== undefined && from !== undefined && to !== undefined ) {
        apart.getApartmentID(userid,function(err,a) {
            if(!err) {
                var id = a.ApartmentID;
                var options = {
                    host: request.app.get('civis_opt').host,
                    path: request.app.get('civis_opt').path + 'downloadmydata?' + querystring.stringify(
                        {
                            usagepoint: id,
                            from: from,
                            to: to,
                            res: res,
                            type: TYPE
                        })
                };
            var requestprod = https.get(options, function (res) {
                    var data = [];
                    res.on('data', function (d) {
                        data.push(d);
                    }).on('end', function () {
                        data = Buffer.concat(data).toString();
                        parser.parseString(data, function (err, result) {
                            //entry[0] is about current call (apartmentID, type, category)
                            var content = result.feed.entry[1].content;
                            if (content.hasOwnProperty('IntervalBlock')) {
                                var ms = [];
                                var block = content.IntervalBlock;
                                var value = 0.0;
                                block.IntervalReading.forEach(function (interval) {
                                    value += parseFloat(interval.value);
                                    if (interval.timeslot == 'F3') {
                                        ms.push({
                                            date: interval.timePeriod.start,
                                            production: value
                                        });
                                        value = 0.0;
                                    }

                                });
                                response.type('json').status('200').send(ms);

                                trentinoLogs.create({
                                contractId: userid,
                                category: 'Production data',
                                fromDate: from,
                                toDate: to,
                                data: ms
                              });

                            } else {
                                response.status(400).send(content.Message);
                            }
                        });
                    }).on('error', function (e) {
                        response.error(e);
                    });
                });
                requestprod.setTimeout(3000, function() {
                // console.log("waiting under appliance id");
            });
            
            }else {
                response.sendStatus(500);
            }
        });
    }else{
        response.sendStatus(400);
    }
});

/**
 * @api {get} /api/production/last Request the last production data
 * @apiGroup Production
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 * curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *  }'\
 *  http://localhost:3000/api/production/last
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "production": 88.06484
 *   }
 */
router.get('/last',auth.authenticate(),function(request,response,next){

    var userid = request.query.userid;
    if(userid !== undefined ) {

        apart.getApartmentID(userid,function(err,a) {
            if(!err) {
                var id = a.ApartmentID;
                var now = new Date();
                var options = {
                    host: request.app.get('civis_opt').host,
                    path: request.app.get('civis_opt').path + 'downloadmydata?' + querystring.stringify(
                        {
                            usagepoint: id,
                            from: dateFormat(now, "yyyy-mm-dd")+ 'T00:00:00',
                            to: dateFormat(now, "yyyy-mm-dd"),
                            res: 'RAW',
                            type: TYPE
                        })
                };
            var requestlast = https.get(options, function (res) {
                    var data = [];
                    res.on('data', function (d) {
                        data.push(d);
                    }).on('end', function () {
                        data = Buffer.concat(data).toString();
                        parser.parseString(data, function (err, result) {
                            var content = result.feed.entry[1].content;
                            if (content.hasOwnProperty('IntervalBlock')) {
                                var block = content.IntervalBlock;
                                if (block.IntervalReading.length > 0) {
                                    var last = block.IntervalReading[block.IntervalReading.length - 1];
                                    response.type('json').status('200').send({
                                        "production": parseFloat(last.value)
                                    });

                                    trentinoLogs.create({
                                    contractId: userid,
                                    category: 'Production last data',
                                    data: {"production": parseFloat(last.value)}
                                    });

                                } else {
                                    response.status('204').next();
                                }
                            } else {
                                response.status(400).send(content.Message);
                            }
                        });
                    }).on('error', function (e) {
                        response.error(e);
                    });
                });
            requestlast.setTimeout(3000, function() {
                // console.log("waiting under production last");
            });
           
            }else {
                response.sendStatus(500);
            }
        });
    }else{
        response.sendStatus(400);
    }
});


/**
 * @api {get} /api/hasProduction Check whether production is present for a given user
 * @apiGroup Production
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 * curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *  }'\
 *  http://localhost:3000/api/hasProduction
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "production": true
 *   }
 */
router.get('/hasProduction',auth.authenticate(),function(request,response,next){
    var userid = request.query.userid;
    if(userid !==undefined){
        apart.getApartmentID(userid,function(err,a){
            if(!err){
            response.type('json').status(200).send({
                production: a.PV?true:false
            });
        }else {
                response.sendStatus(500);
            }
        })
    }else{
        response.sendStatus(400);
    }
});



module.exports = router;
