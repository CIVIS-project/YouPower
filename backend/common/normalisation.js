var _ = require('underscore');
var fs = require('fs');
var csv = require('csv');
var moment = require('moment');
var request = require('request');
var async = require('async')
var consumption = require('../models/consumption')
var i = 0;

var parser = csv.parse({delimiter: ';',columns:['from','to','date','temp'],skip_empty_lines:true});

//var transform = function(from,to,cb) {
//
//  return
//};

var month = function(data) { return data.date.month()};
var dayOfMonth = function(data) { return data.date.date()};
var sumTemp = function(memo, data) {return memo + data.temp};
var degreeDay = function(data) { return { temp: data.temp < 17 ? 17 - data.temp : 0}};

var readTempFromFile = function(from,to,cb) {
  var from = moment(from,'YYYYMM').subtract(1,'day');
  var to = moment(to,'YYYYMM').add(1,'month');
  fs.createReadStream(__dirname+'/../../../civis-data/temp_data.csv').
  pipe(parser).
  pipe(csv.transform(function(data){
    var date = moment(data.date,'YYYY-MM-DD');
    if(date.isBetween(from,to)) {
      return {
        date: date,
        temp: parseFloat(data.temp)
      };
    }
  },cb))
}

var readTempFromAPI = function(from, to, cb) {
  to = to ? '-' + to : '';
  request({
    url: 'https://app.metry.io/api/v2/weather/98210/day/' + from + to
  },function(error, response, body){
    if(!error && response.statusCode == 200) {
      from = moment(from,'YYYYMM');
      var result = JSON.parse(body).data[0].periods[0].temperature;
      result = _.map(result,function(value, index) {
        return  {
          date: moment(from).add(index,'days'),
          temp: value
        }
      })
      cb(null, result);
    } else {
      cb(error);
    }
  });
}

// Read temp daily temp data from file for given range (between YYYY or YYYYMM)
var getDegreeMonths = function(from,to,cb) {
  readTempFromAPI(from,to,function (err,data) {
    cb(err, _.chain(data)
      .groupBy(month)
      .mapObject(function(daysInMonth,month){
        return _.chain(daysInMonth)
          .groupBy(dayOfMonth)
          .omit(function(value,key){ return month == 1 && key == 29}) // Remove Feb 29th from all calculations
          .mapObject(function(days,day){
            return {temp: _.reduce(days, sumTemp, 0) / days.length};
          })
          .mapObject(degreeDay)
          .reduce(sumTemp,0)
          .value()
      })
      .value())
  })
}

// DegreeDayMonthNormal = Sum of all DegreeDayNormal per month
var getDegreeDayMonthsNormal = async.memoize(function(cb) {
  getDegreeMonths('1981','201012',cb);
})

var getSummerMonthValues = function(meters, date, from, values, getValuesFn, cb) {
  if(date.month() < 8) {
    date.subtract(1,'y');
  }
  date.month(5);
  var diff = date.diff(from,'M');
  if (diff <0 || diff+2>=values.length){
    var when = moment(date);
    getValuesFn(meters,'heating','month',when.format("YYYYMM") + '-' + when.add(2,'M').format('YYYYMM'),null,function(err,vals){
      cb(err,_.reduce(vals,function(a,b){return a+b},0) / 3);
    })
  } else {
    cb(null, (values[diff] + values[diff+1] + values[diff+2])/3 );
  }
}


exports.normalizeHeating = function(meters, from, to, values, getValuesFn, cb) {
  from =  from.toString();
  if(from.indexOf('-') > 0) {
    to = from.split('-')[1]
    from = from.split('-')[0]
  }
  from = moment(from,'YYYYMM')
  to = to ? moment(to,'YYYYMM') : from.add(1,'y');
  var results = [];
  async.parallel({
    degreeMonthsNormal: getDegreeDayMonthsNormal,
    degreeMonths: function(callback){
      getDegreeMonths(from.format('YYYYMM'),to.format('YYYYMM'),callback)
    },
    heatingAndHotWaterJulyToAugust: function(callback) {async.forEachOf(values,function(data,index,cb){
      var date = moment(from).add(index,'M');
      getSummerMonthValues(meters,moment(date),from,values,getValuesFn,function(err, result){
        results[index] = result;
        cb(err);
      })
    },function(err){
      callback(err,results);
    })}
  },function(err, result){
    console.log(values);
    console.log(result);
    result = _.map(values, function(value, index){
      var month = moment(from).add(index,'M').month();
      if(month >=5 && month <=7) {
        return value;
      }else {
        var dd = (result.degreeMonthsNormal[month]/result.degreeMonths[month]) || 1;
        return value * dd + result.heatingAndHotWaterJulyToAugust[index] * (1 - dd)
      }
    })
    console.log(result);
    cb(err,result);
  })
}





