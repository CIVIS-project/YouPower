'use strict';

/**
 * CONSUMPTION API
 */
var TYPE = 'S_CONS';

var dateFormat = require('dateformat');
var moment = require('moment');
var https = require('https');
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var xml2js = require('xml2js');
var apart = require('../models/apartment.js');
var usagepoint = require('../models/usagesummary');
var hourlyUsage = require('../models/municipalityhourlyusage');
var auth = require('../middleware/auth');
var Log = require('../models').logs;
var fs = require('fs');

var parser = new xml2js.Parser({
    explicitArray:false
});

/**
 * @api {get} /consumption Request a time series of consumption data
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
 *      "userid":9999,
 *      "from":2015-10-10,
 *      "to":2015-10-11
 *  }'\
 *  http://localhost:3000/api/consumption
 *
 * @apiSuccessExample {json} Success-Response:
 *[
 *{ 
 *   "date": "2016-05-12T02:00:00+02:00", 
 *   "duration": "3600", 
 *   "consumption": 69.6736526489258, 
 *   "contractId": "138", 
 *   "averagePower": "69.67"
 *}, 
 *{ 
 *   "date": "2016-05-12T07:00:00+02:00", 
 *   "duration": "3600", 
 *   "consumption": 150.57075214386, 
 *   "contractId": "138", 
 *   "averagePower": "150.57"
 *}
 *]
 */
router.get('/',auth.authenticate(),function(request,response,next){
    var userid = request.query.userid;
    var from = request.query.from;
    var to = request.query.to;
    var res = request.query.res || 'DAILY';
    var source = request.query.requestSource;
    if(userid !== undefined && from !== undefined && to !== undefined ) {
        apart.getApartmentID(userid,function(err,a) {
            if(!err || (source == 2)) {
                var id = (source == 2)?userid:a.ApartmentID;
                var options = {
                    cache: true,
                    agent: false,
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
                                var blockArray = [];
                                /** Check if the length of interval reading is just one,
                                    if one, convert to array of object to use forEach */
                                if(block.IntervalReading.length==undefined){
                                    blockArray.push(block.IntervalReading);
                                    block.IntervalReading = blockArray;
                                }         
                                block.IntervalReading.forEach(function (interval) {
                                    value += parseFloat(interval.value);
                                    var duration = parseFloat(interval.timePeriod.duration/3600);
                                        ms.push({
                                            date: interval.timePeriod.start,
                                            duration: interval.timePeriod.duration,
                                            consumption: value,
                                            contractId: id,
                                            averagePower: (value/duration).toFixed(2)
                                        });
                                        value = 0.0;
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
            requestcons.setTimeout(500, function() {
                requestcons.end();
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
 * @api {get} /consumption/last Request the last consumption data
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
 *      "userid":9999,
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
                            from: moment.utc(now).subtract(12, 'days').format('YYYY-MM-DD'),
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
                                    var duration = parseFloat(last.timePeriod.duration/3600);
                                    var consumption_level = parseFloat(last.value);
                                    var startTime = last.timePeriod.start;
                                    response.type('json').status('200').send({
                                        "consumption": consumption_level.toFixed(2),
                                        "power_Level": (consumption_level/duration).toFixed(2),
                                        "startTime": startTime
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
            requestLast.setTimeout(500, function() {
                requestLast.end();
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
 * @api {get} /consumption/appliance Request a list of appliances for which detailed consumption data is available
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
 *      "userid":9999,
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
            applianceRequest.setTimeout(500, function() {
                applianceRequest.end();
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
 * @api {get} /consumption/appliance/:applID Request a time series of consumption data for the appliance
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
 *      "userid":9999,
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
            applianceRequest.setTimeout(500, function() {
                applianceRequest.end();
            });
            }else {
                response.sendStatus(500);
            }
        })
    }else{
        response.sendStatus(400);
    }
});
/**
 * @api {get} /consumption/usagepoints Request list of usagepoint ids 
 * @apiGroup Consumption
 * @apiParam {String} city
 * @apiParam {String} token
 *
 *  *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "city":storo,
 *  }'\
 *  http://localhost:3000/api/consumption/usagepoints
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *      "0",
 *      "999"
 *  ]
 */
router.get('/usagepoints',auth.authenticate(),function(request,response,next){
     var municipalityId = request.query.municipalityId;
     var municipalityIdReal = (municipalityId=='sanlorenzo')?"San Lorenzo in Banale":"storo";
     var usagePoints = [];
     var options = {
                    host: request.app.get('civis_opt').host,
                    path: request.app.get('civis_opt').path + 'getAllUsagePoints?' + querystring.stringify(
                        {
                            city: municipalityIdReal,
                        }),
                     // cert: [fs.readFileSync('backend/ssl/RootCATest.cer')],
                     rejectUnauthorized : false,
                     strictSSL: false
                };
                var reqUsagePoints = https.get(options, function (res) {
                var data = [];
                res.on('data', function (d) {
                    data.push(d);
                }).on('end', function () {
                    data = Buffer.concat(data).toString();
                    parser.parseString(data, function (err, result) {
                        var content = result.feed.entry;
                        content.UsagePoint.forEach(function(points){
                            usagePoints.push(points.usagePointID);
                        });
                        response.type('json').status('200').send(usagePoints);
                    });
                }).on('error',function(e){
                    response.sendStatus(500);
                });
});
                reqUsagePoints.end();
});
/**
 * @api {get} /consumption/allusagepointssummary Request total consumption of households in different energy tariff levels
 * @apiGroup Household
 * @apiParam {String} token
 *
 *  *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  http://localhost:3000/api/consumption/allusagepointssummary
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *       {
 *           "_id" : ObjectId("5716a15da47650d1a1965c4b"),
 *           "City" : "sanlorenzo",
 *           "Green" : 171369.54,
 *           "Red" : 11844.76,
 *           "UsagePoint" : "0",
 *           "DateTakenLast" : "2016-04-19"
 *       }
 *        {
 *           "_id" : ObjectId("5716a15da47650d1a1965c4c"),
 *           "City" : "sanlorenzo",
 *           "Green" : 109297.15,
 *           "Red" : 10138.85,
 *           "UsagePoint" : "999",
 *           "DateTakenLast" : "2016-04-19"
 *       }
 *   ]
 */
router.get('/allUsagePointsSummary',auth.authenticate(),function(request,response,next){
    var userid = request.query.userid;
    var allUsageSummary = [];
    usagepoint.findTotalUsageSummary(function(err,result){
        if(!err){
        result.forEach(function(summarydata){
            allUsageSummary.push(summarydata);
        });
         apart.getApartmentID(userid,function(err,a){
            if(!err){
            var id = a.ApartmentID;
            allUsageSummary.push(id);
            response.status(200).type('json').send(allUsageSummary);
             Log.create({
                                category: 'Trentino power-consumption chart',
                                type: 'get',
                                data: {
                                    contractId: userid                                    }
                              });
         }else{
            response.sendStatus(404);
         }
        }); 
    }else{
        response.sendStatus(404);
    }
    });
});
/**
 * @api {get} /consumption/hourlyconsumption Request hourly consumption of all usagepoints
 * @apiGroup Household
 * @apiParam {Date} givenDate
 * @apiParam {String} token
 *
 *  *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *  '{
 *      "givenDate":2016-05-27,
 *  }'\
 *  http://localhost:3000/api/consumption/hourlyconsumption
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *        {
 *          "_id" : ObjectId("57548bdf3d67570c2cddd5ac"),
 *          "UsagePoint" : 0,
 *           "City" : "storo",
 *          "DateTaken" : ISODate("2016-05-27T00:00:00.000Z"),
 *           "HourlyTotal" : 145.02,
 *          "__v" : 0
 *      },
 *       {
 *           "_id" : ObjectId("57548bdf3d67570c2cddd5b2"),
 *           "UsagePoint" : 999,
 *           "City" : "storo",
 *           "DateTaken" : ISODate("2016-05-27T06:00:00.000Z"),
 *           "HourlyTotal" : 572.45,
 *           "__v" : 0
 *       }
 *   ]
 */
router.get('/hourlyconsumption',auth.authenticate(),function(request,response,next){
    var givenDate = request.query.givenDate; 
    var hourlyConsumption = [];
    hourlyUsage.findMunicipalityHourlyUsage(givenDate, function(err,result){
        /* If there is data, actually there is not error, so do other tasks */
        if(!err){
            hourlyConsumption.push(result);
            response.status(200).type('json').send(hourlyConsumption);   
    }else{
            response.sendStatus(404);
    }
    Log.create({
            category: 'Trentino hourly consumption request',
            type: 'get',
            data: {
                consumptionData: result                                    }
          });

    });
});
/**
 * @api {post} /consumption/addhourlyconsumption Create hourly consumption data 
 * @apiGroup Consumption
 * @apiParam {json}   hourlyConsumption Hourly consumption data of a household in a given day
 * @apiParam {String} token
 *
 *  *  @apiExample {curl} Example usage:
 *  # Get API token via /api/user/token
 *  export API_TOKEN=fc35e6b2f27e0f5ef...
 *
 *  curl -i -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $API_TOKEN" -d \
 *[[
 * { 
 *   "date": "2016-05-12T02:00:00+02:00", 
 *   "duration": "3600", 
 *   "consumption": 69.6736526489258, 
 *   "averagePower": "69.67",
 *   "contractId": "0"
 *}, 
 *{ 
 *   "date": "2016-05-12T07:00:00+02:00", 
 *   "duration": "3600", 
 *   "consumption": 150.57075214386, 
 *   "averagePower": "150.57",
 *   "contractId": "0"
 *}
 *],'sanlorenzo']
 *
 *  http://localhost:3000/api/consumption/addhourlyconsumption
 *
 */
router.post('/addHourlyConsumption', auth.authenticate(), function(req,res,next){
    var hourlyConsumptionData = req.body;
    var output = [];
    hourlyUsage.create(hourlyConsumptionData,function(err,result){
        res.end();
    });
});
/**
 * @api {get} /consumption/getusagepointid Request usage point Id of a household
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
 *      "userid":9999,
 *  }'\
 *  http://localhost:3000/api/household/getusagepointid
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *     "apartmentId": 0
 *   }
 */
router.get('/getUsagePointId',auth.authenticate(),function(request,response,next){
    var contractId = request.query.contractId;
    var apartmentID;
    apart.getApartmentID(contractId,function(err,a) {
        if(!err){
            apartmentID = a.ApartmentID;
            response.type('json').status('200').send({"apartmentID":apartmentID});
        }else{
            response.sendStatus(404);
        }
        Log.create({
            category: 'Usage point Id request',
            type: 'get',
            data: {
                consumptionData: apartmentID                                    }
          });
    });
});
module.exports = router;
