'use strict';

/**
 * CONSUMPTION API
 */
var TYPE = 'S_CONS';

var dateFormat = require('dateformat');
var https = require('https');
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var xml2js = require('xml2js');
var apart = require('../models/apartment.js');
var auth = require('../middleware/auth');
var Log = require('../models').logs;
var fs = require('fs');

var parser = new xml2js.Parser({
    explicitArray:false
});

/**
 * @api {get} /api/consumption Request a time series of consumption data
 * @apiGroup Consumption
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 * @apiParam {Date} from
 * @apiParam {Date} to
 * @apiParam {String} res=DAILY resolution (RAW,HOURLY,DAILY,WEEKLY,MONTHLY)
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *      "from":2015-10-10,
 *      "to":2015-10-11
 *  }'\
 *  http://localhost:3000/api/consumption
 *
 * @apiSuccessExample {json} Success-Response:
 *[
 *  {
 *      "date": "2015-10-10T00:00:00+02:00",
 *      "consumption": 7050.58074736595
 *  },
 *  {
 *      "date": "2015-10-11T00:00:00+02:00",
 *      "consumption": 7425.87361526489
 *  }
 *]
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
                        }),
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     rejectUnauthorized : false,
                     strictSSL: false
                };
            var requestcons = https.get(options, function (res) {
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
                                            consumption: value
                                        });
                                        value = 0.0;
                                    }
                                });
                                response.type('json').status('200').send(ms);

                                Log.create({
                                category: 'Consumption data',
                                type: 'get',
                                data: {
                                    contractId: userid,
                                    from: from,
                                    to: to,
                                    consumption: ms       
                                }
                              });

                            } else {
                                response.status(400).send(content.Message);
                            }
                        });
                    }).on('error', function (e) {
                        response.error(e);
                    });
                });
            requestcons.setTimeout(3000, function() {
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
 * @api {get} /api/consumption/last Request the last consumption data
 * @apiGroup Consumption
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 *
 *  *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *  }'\
 *  http://localhost:3000/api/consumption/last
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "consumption": 4864.516356505453
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
                        }),
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     rejectUnauthorized : false,
                     strictSSL: false
                };
            var requestLast =    https.get(options, function (res) {
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
                                        "consumption": parseFloat(last.value)
                                    });

                                Log.create({
                                category: 'Consumption last data',
                                type: 'get',
                                data: {
                                    contractId: userid,
                                    consumption: parseFloat(last.value) 
                                }
                              });

                                } else {
                                    response.status('204').send();
                                }
                            } else {
                                response.status(400).send(content.Message);
                            }
                        });
                    }).on('error', function (e) {
                        response.error(e);
                    });
                });
            requestLast.setTimeout(3000, function() {
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
 * @api {get} /api/consumption/appliance Request a list of appliances for which detailed consumption data is available
 * @apiGroup Consumption
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *  }'\
 *  http://localhost:3000/api/consumption/appliance
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *  {
 *      "appliance": "Consumo Elettrico",
 *      "_id": "0",
 *      "lastSampleTimestamp": "2015-10-05T00:00:00+02:00"
 *    },
 *    {
 *      "appliance": "Freezer",
 *      "_id": "1",
 *      "lastSampleTimestamp": "2015-10-05T00:00:00+02:00"
 *    },
 *    {
 *      "appliance": "Lavatrice",
 *      "_id": "2",
 *      "lastSampleTimestamp": "2015-10-05T00:00:00+02:00"
 *    },
 *    {
 *      "appliance": "Produz. Elettrica",
 *      "_id": "8",
 *      "lastSampleTimestamp": "2015-10-05T00:00:00+02:00"
 *    },
 *    {
 *      "appliance": "Temp. Interna",
 *      "_id": "32",
 *      "lastSampleTimeStamp": "2015-10-05T00:00:00+02:00"
 *    }
 * ]
 */
router.get('/appliance',auth.authenticate(),function(request,response,next){

    var userid = request.query.userid;
    if(userid !== undefined){
        apart.getApartmentID(userid,function(err,a) {
            if(!err) {
                var id = a.ApartmentID;
                var options = {
                    host: request.app.get('civis_opt').host,
                    path: request.app.get('civis_opt').path + 'getAllSensors',
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     rejectUnauthorized : false,
                     strictSSL: false
                };
            var applianceRequest = https.get(options, function (res) {
                    var data = [];
                    res.on('data', function (d) {
                        data.push(d);
                    }).on('end', function () {

                        data = Buffer.concat(data).toString();
                        parser.parseString(data, function (err, result) {
                            var content = result.feed.entry.content;
                            var res = [];
                            for (var i = 0; i < content.UsagePoint.length; i++) {
                                if (content.UsagePoint[i].ApartmentID == id) {
                                    content.UsagePoint[i].sensors.sensor.forEach(function (sensor) {
                                        res.push({
                                            appliance: sensor.label,
                                            _id: sensor.sensorNumber,
                                            lastSampleTimestamp: sensor.lastSampleTimestamp
                                        });
                                    });
                                    //stop here
                                    break;
                                }
                            }
                            response.status(200).type('json').send(res);

                            Log.create({
                                category: 'Appliance list data',
                                type: 'get',
                                data: {
                                    contractId: userid,
                                    applianceList: res                                     }
                              });
                        });

                    }).on('error', function (e) {
                        response.error(e);
                    });
                });
            applianceRequest.setTimeout(3000, function() {
                // console.log("waiting under applicance");
            });
              
            }else {
                response.sendStatus(500);
            }
        });
    }else{
        response.sendStatus(400);
    }
})

/**
 * @api {get} /api/consumption/appliance/:applID Request a time series of consumption data for the appliance
 * @apiGroup Consumption
 * @apiParam {Number} applID
 * @apiParam {Number} userid ContractID
 * @apiParam {String} token
 * @apiParam {Date} from
 * @apiParam {Date} to
 * @apiParam {String} res=DAILY resolution (RAW,HOURLY,DAILY,WEEKLY,MONTHLY)
 *
 *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "userid":104532,
 *      "from":2015-10-05,
 *      "to":2015-10-06
 *  }'\
 *  http://localhost:3000/api/consumption/appliance/1
 *
 * @apiSuccessExample {json} Success-Response:
 * [
 *    {
 *      "date": "2015-10-05T00:00:00+02:00",
 *      "consumption": "534.827468425035"
 *    },
 *    {
 *      "date": "2015-10-05T00:00:00+02:00",
 *      "consumption": "213.072995232185"
 *    },
 *   {
 *      "date": "2015-10-05T00:00:00+02:00",
 *      "consumption": "281.020645804703"
 *    },
 *    {
 *      "date": "2015-10-06T00:00:00+02:00",
 *      "consumption": "526.704251356423"
 *    },
 *    {
 *      "date": "2015-10-06T00:00:00+02:00",
 *      "consumption": "218.13283588551"
 *    },
 *    {
 *      "date": "2015-10-06T00:00:00+02:00",
 *      "consumption": "299.548069406301"
 *    }
 * ]
 */
router.get('/appliance/:applID',auth.authenticate(),function(request,response,next){
    var appliance = request.params.applID;
    var userid = request.query.userid;
    var from = request.query.from;
    var to = request.query.to;
    var res = request.query.res || 'DAILY';
    if(appliance == undefined){
        response.status(400).send('No appliance ID');
    }
    //mandatory fields
    if(userid !== undefined && from !== undefined && to !== undefined ) {
        apart.getApartmentID(userid,function(err,a){
            if(!err) {
                var id = a.ApartmentID;
                var options = {
                    host: request.app.get('civis_opt').host,
                    path: request.app.get('civis_opt').path + 'downloadmyappliancedata?' + querystring.stringify(
                        {
                            usagepoint: id,
                            from: from,
                            to: to,
                            res: res
                        }),
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     rejectUnauthorized : false,
                     strictSSL: false
                    // rejectUnauthorized : false
                };
            var applianceRequest = https.get(options, function (res) {
                    var data = [];
                    res.on('data', function (d) {
                        data.push(d);
                    }).on('end', function () {
                        data = Buffer.concat(data).toString();
                        parser.parseString(data, function (err, result) {
                            var content = result.feed.entry[1].content;
                            if (content.hasOwnProperty('IntervalBlock')) {
                                //content is the list of intervals
                                var ms = [];
                                var block = content.IntervalBlock;
                                block.IntervalReading.forEach(function (interval) {
                                    if (interval.sensorNumber === appliance) {
                                        ms.push({
                                            date: interval.timePeriod.start,
                                            consumption: interval.value
                                        });
                                    }
                                });
                                response.type('json').status('200').send(ms);
                                
                                Log.create({
                                category: 'Specific appliance data',
                                type: 'get',
                                data: {
                                    contractId: userid,
                                    from: from,
                                    to: to,
                                    ApplianceData: ms                                      }
                              });

                            } else {
                                //content should be an error message
                                response.status(400).send(content.Message);
                            }
                        });

                    }).on('error', function (e) {
                        response.error(e);
                    });
                });
                applianceRequest.setTimeout(3000, function() {
                // console.log("waiting under appliance id");
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
