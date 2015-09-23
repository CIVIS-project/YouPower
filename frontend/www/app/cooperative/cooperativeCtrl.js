'use strict';

angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope,$timeout,Cooperatives) {


  // Get the cooperative, currently hardcoded
  Cooperatives.get({id:'55f14ce337d4bef728a861ab'},function(data){
    $scope.cooperative = data;

    // Setup highcharts
    $scope.chartConfig = {

      // Standard configuration option
      options: {
          //This is the Main Highcharts chart config. Any Highchart options are valid here.
          //will be overriden by values specified below.
          chart: {
            animation: true,
            type: 'column'
          },
          legend: {
            enabled: false
          },
          yAxis: [{
            gridLineWidth: 0,
            title: null,
            labels: {
              enabled: false
            }
          },{
            gridLineWidth: 0,
            title: null,
            labels: {
              enabled: false
            }
          }],
      },

      //The below properties are watched separately for changes.
      series: [{
         data: demoData([85, 91, 81, 70, 64, 50, 41, 53, 60, 89, 82, 94]),
         // pointPadding: 0.001,
         groupPadding: 0.01
      },{
        data:  demoData([81, 92, 84, 75, 61, 55, 42, 58, 62, 81, 87, 91]),
        type: 'spline'
      }],

      title: {
         text: null
      },

      xAxis: {
        // categories: $scope.categories,
        type: 'datetime',
        // tickWidth: 0,
        // tickLength: 20,
        // labels: {
        //   y: -10,
        //   useHTML: true,
        //   formatter: function(){
        //     if($scope.cooperative) {
        //       var currentPeriod = this.value;
        //       var actionsInPeriod = _.reduce($scope.cooperative.actions,function(result, action, index){
        //         var date = new Date(action.date);
        //         if(currentPeriod.value == date.getMonth()){
        //           result = result + (result.length ? ", " : "") + (index + 1);
        //         }
        //         return result;
        //       },"");
        //       return this.value.label + "<br><span class='badge badge-energized'>" + actionsInPeriod + "</span>";
        //     } else return this.value.label;
        //   }
        // },
      },
      func: function(chart) {
        $timeout(function(){
          chart.series[1].setVisible(false);
          $scope.getMainMax = function(){
            // var chart = $scope.chartConfig.getHighcharts();
            return _.max(chart.series[0].data,function(value){return value.y});
          }

          $scope.getMainMin = function(){
            // var chart = $scope.chartConfig.getHighcharts();
            return _.min(chart.series[0].data,function(value){return value.y});
          }

          $scope.getMainAvg = function(){
            // var chart = $scope.chartConfig.getHighcharts();
            return _.reduce(chart.series[0].data,function(memo, value){return memo + (value ? value.y : 0)},0)/chart.series[0].data.length;
          }

          $scope.getComparedMax = function(){
            // var chart = $scope.chartConfig.getHighcharts();
            return _.max(chart.series[1].data,function(value){return value.y});
          }

          $scope.getComparedMin = function(){
            // var chart = $scope.chartConfig.getHighcharts();
            return _.min(chart.series[1].data,function(value){return value.y});
          }

          $scope.getComparedAvg = function(){
            // var chart = $scope.chartConfig.getHighcharts();
            return _.reduce(chart.series[1].data,function(memo, value){return memo + (value ? value.y : 0)},0)/chart.series[1].data.length;
          }
        });
      }
    };
  });


  var energyType =[];

  $scope.comparisons = [
    {name: ""},
    {name: "similar cooperatives (average)"},
    {name: "previous year"},
    {name: "previous year (normalized)"}
  ]

  $scope.settings = {
    granularity: "monthly",
    compareTo: ""
  }

  $scope.changeComparison = function(){
    var chart = $scope.chartConfig.getHighcharts();
    if($scope.settings.compareTo != "") {
      chart.series[1].setVisible(true);
    }else{
      chart.series[1].setVisible(false);
    }
  };

  $scope.categories = [ { label: 'J', value: 0 },
  { label: 'F', value: 1 },
  { label: 'M', value: 2 },
  { label: 'A', value: 3 },
  { label: 'M', value: 4 },
  { label: 'J', value: 5 },
  { label: 'J', value: 6 },
  { label: 'A', value: 7 },
  { label: 'S', value: 8 },
  { label: 'O', value: 9 },
  { label: 'N', value: 10 },
  { label: 'D', value: 11 } ];

  $scope.period = 'monthly';

  $scope.toggleType = function(type){
    if(energyType.indexOf(type)<0) {
      energyType.push(type);
    } else {
      energyType.splice(energyType.indexOf(type),1);
    }
  }
  $scope.togglePeriod = function(){
    if($scope.period == 'yearly'){
      $scope.period = 'monthly'
    }
    else{
      $scope.period = 'yearly'
    }

  }

  $scope.isActive = function(type) {
    return energyType.indexOf(type)>=0;
  }

  $scope.moveFwd = function() {
    var chart = $scope.chartConfig.getHighcharts();
    var date = new Date(_.last(chart.series[0].data).x)
    date.setMonth(date.getMonth()+1);
    if(date < new Date()) {
      chart.series[0].addPoint({x:date,y:_.random(40,95)},false,true);
      chart.series[1].addPoint({x:date,y:_.random(40,95)},false,true);
      chart.redraw();
    }
  }

  $scope.moveBwd = function() {
    var chart = $scope.chartConfig.getHighcharts();
    chart.series[0].removePoint(11,false);
    chart.series[1].removePoint(11,false);
    var date = new Date(_.first(chart.series[0].data).x)
    date.setMonth(date.getMonth()-1);
    chart.series[0].addPoint({x:date,y:_.random(40,95)},false,false);
    chart.series[1].addPoint({x:date,y:_.random(40,95)},false,false);
    chart.redraw();
    // $scope.categories.rotate(-1);
  }

  $scope.addAction = function(action){
    Cooperatives.addAction({id:$scope.cooperative._id},action)
  }





  var demoData = function(array){
    var result = _.map(array, function(value,index){
      var date = new Date();
      date.setDate(1);
      console.log("Value:", value, "Index:", index)
      return {x: date.setMonth(date.getMonth()-index), y: value}
    }).reverse();
    console.log(result);
    return result;
  }


  // EMService.getMonthlyConcumptions('530c4de3c0fa4631158bd686','2015').then(function(data){
  //   console.log(data);
  // })

})
