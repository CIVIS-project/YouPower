'use strict';

angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope,$timeout,$state,$q,Cooperatives) {

  $scope.comparisons = [
    {name: ""},
    {name: "similar cooperatives (average)"},
    {name: "previous year"},
    {name: "previous year (normalized)"}
  ]

  var currentDate = new Date();
  currentDate.setDate(1);

  $scope.settings = {
    granularity: "monthly",
    compareTo: "",
    type: "electricity",
    endDate: currentDate
  }

  $scope.changeComparison = function(){
    updateEnergyData();
  };

  $scope.changeType = function(type){
    $scope.settings.type = type;
    updateEnergyData();
  }

  $scope.changeGranularity = function(granularity){
    $scope.settings.granularity = granularity;
    updateEnergyData();
  }

  $scope.$on("$ionicView.enter",function(){
    // Get the cooperative, currently hardcoded
    Cooperatives.get({id:'55f14ce337d4bef728a861ab'},function(data){
      $scope.cooperative = data;
      initChart();
    });
  })

  // Sets the initial chart configuration
  var initChart = function(data) {
    if($scope.chartConfig) {
      return;
    }

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
           data: data,
           // pointPadding: 0.001,
           groupPadding: 0.01
        },{
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
            updateEnergyData();


            // View functions that only make sense when data is loaded
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
      }
  }

  // Helper function should be moved somewhere more general
  var padMonth = function(value) {
    return value < 10 ? '0' + value : '' + value;
  }

  // Updates the chart depending on the granularity, period, type of energy and comparison
  var updateEnergyData = function() {
    $scope.chartConfig.loading = true;
    var period;
    var chart = $scope.chartConfig.getHighcharts();
    var startDate = new Date($scope.settings.endDate);
    var toYear = startDate.getFullYear();
    if($scope.settings.granularity == 'yearly'){
      var fromYear = 2010;
      period = fromYear + '-' + toYear;
    } else {
      var toMonth = padMonth(startDate.getMonth())
      startDate.setFullYear(startDate.getFullYear()-1);
      var fromYear = startDate.getFullYear();
      var fromMonth = padMonth(startDate.getMonth() + 1);
      period = fromYear + fromMonth + '-' + toYear + toMonth;
    }
    var results = [];
    results.push($scope.cooperative.getEnergyData($scope.settings.type,'month',period));
    if($scope.settings.compareTo ==  "previous year" && $scope.settings.granularity == 'monthly'){
      period = (fromYear -1) + fromMonth + '-' + (toYear-1) + toMonth;
      results.push($scope.cooperative.getEnergyData($scope.settings.type,'month',period));
    }
    $q.all(results).then(function(response){
      _.each(response,function(data,i){
        if($scope.settings.granularity == 'yearly'){
          chart.series[i].setData(_.reduce(data.data.data[0].periods[0].energy,function(memo,value,index){
            if(index % 12 == 0){
              var date = new Date(2010 + Math.floor(index/12),1,1);
              memo.push({x:date, y:value});
            } else {
              memo[memo.length - 1].y += value;
            }
            return memo;
          },[]));
        } else {
          chart.series[i].setData(_.map(data.data.data[0].periods[0].energy,function(value, index){
            var date = new Date(startDate);
            date.setDate(1);
            date.setMonth(date.getMonth()+index)
            return { x: date, y:value/1000}
          }));
        }
        chart.series[i].setVisible(true);
      });
      chart.redraw();
      $scope.chartConfig.loading = false;
    });
  }

  // Moves the chart one month forward/back
  $scope.move = function(direction) {
    $scope.chartConfig.loading = true;
    var fn = direction > 0 ? _.last : _.first;
    var chart = $scope.chartConfig.getHighcharts();
    var date = new Date(fn(chart.series[0].data).x)
    date.setMonth(date.getMonth() + direction);
    $scope.settings.endDate.setMonth($scope.settings.endDate.getMonth() + direction);
    var period = date.getFullYear() + '' + padMonth(date.getMonth()+1);
    var results = []
    results.push($scope.cooperative.getEnergyData($scope.settings.type,'month',period));
    if($scope.settings.compareTo ==  "previous year"){
      period = (date.getFullYear() - 1) + '' + padMonth(date.getMonth()+1);
      results.push($scope.cooperative.getEnergyData($scope.settings.type,'month',period));
    }
    $q.all(results).then(function(data){
      var value1 = data[0].data.data[0].periods[0].energy[0];
      var value2 = data.length == 2 ? data[1].data.data[0].periods[0].energy[0] : null;
      if (value1 != null) {
        if(direction > 0) {
          chart.series[0].removePoint(0,false);
          chart.series[0].addPoint({x:date,y:value1/1000},false,false);
          chart.series[1].removePoint(0,false);
          if (value2 != null) {
            chart.series[1].addPoint({x:date,y:value2/1000},false,false);
          }
        } else {
          chart.series[0].removePoint(11,false);
          chart.series[0].addPoint({x:date,y:value1/1000},false,false);
          chart.series[1].removePoint(11,false);
          if (value2 != null) {
            chart.series[1].addPoint({x:date,y:value2/1000},false,false);
          }
        }
        chart.redraw();
        $scope.chartConfig.loading = false;
      }
    });
  }

})

.controller('CooperativeEditCtrl', function($scope,$state,Cooperatives){
  $scope.$on("$ionicView.enter",function(){
    // Get the cooperative, currently hardcoded
    Cooperatives.get({id:'55f14ce337d4bef728a861ab'},function(data){
      $scope.cooperative = data;
    });
  })

  $scope.deleteAction = function(action){
    Cooperatives.deleteAction({id:'55f14ce337d4bef728a861ab',actionId:action._id},function(){
      $scope.cooperative.actions.splice($scope.cooperative.actions.indexOf(action),1);
    });
  }

  $scope.save = function(){
    Cooperatives.update({id:'55f14ce337d4bef728a861ab'},$scope.cooperative,function(){
      $state.go("^");
    })
  }

})

.controller('CooperativeActionAddCtrl', function($scope,$state,Cooperatives){
  $scope.action = {};

  $scope.addAction = function(){
    Cooperatives.addAction({id:'55f14ce337d4bef728a861ab'},$scope.action,function(){
      $state.go("^");
    })
  };
})

.controller('CooperativeActionUpdateCtrl', function($scope,$state,$stateParams,Cooperatives){
  Cooperatives.get({id:'55f14ce337d4bef728a861ab'},function(data){
    $scope.action = _.findWhere(data.actions,{_id:$stateParams.id});
    $scope.action.date = new Date($scope.action.date);
  });


  $scope.updateAction = function(){
    Cooperatives.updateAction({id:'55f14ce337d4bef728a861ab',actionId:$scope.action._id},$scope.action,function(){
      $state.go("^");
    })
  };
})
