angular.module('civis.youpower')

.controller('EnergyGraphCtrl', ['$scope','$timeout','$q','$translate','$filter', function($scope,$timeout,$q,$translate,$filter){

  var startYear = 2010;

  $scope.changeComparison = function(){
    updateEnergyData().then(function(){
      mixpanel.track('Graph filtered', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo});
    });
  };

  $scope.changeType = function(type){
    updateEnergyData(type).then(function(){
      $scope.settings.type = type;
      mixpanel.track('Graph filtered', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo});
    });
  }

  $scope.changeGranularity = function(granularity){
    updateEnergyData($scope.settings.type,granularity).then(function(){
      $scope.settings.granularity = granularity;
      mixpanel.track('Graph filtered', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo});
    });
  }

  $scope.getCorrectDate = function(date) {
    if(date) {
      var result = new Date(date);
      if($scope.settings.compareTo == 'GRAPH_COMPARE_PREV_YEAR') {
        result.setFullYear(result.getFullYear() - 1);
      }
      return result;
    }
  }

  $scope.getTypeClass = function(type) {
    return $scope.settings.type == type.name ? type.cssClass : '';
  }

  // Sets the initial chart configuration
  $scope.$on('civisEnergyGraph.init', function(event) {
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
            tooltip: {
              shared: true,
              valueSuffix: " " + $scope.settings.unit,
              valueDecimals: 0,
              pointFormat: '<span style="color:{point.color}">\u25CF </span><b>{point.y}</b><br/>'
            },
        },

        //The below properties are watched separately for changes.
        series: [{
          // pointPadding: 0.001,
          groupPadding: 0.01,
          onSeries: 'dataseries',
          tooltip: {
            shared: true,
            valueSuffix: " " + $scope.settings.unit,
            valueDecimals: 2
          }
        },{
          type: 'spline',
          onSeries: 'dataseries',
          tooltip: {
            shared: true,
            valueSuffix: " " + $scope.settings.unit,
            valueDecimals: 2,
          }
        },{
          type: 'flags',
          shape: 'circlepin',
          style: {
            color: '#ffffff'
          },
          color: '#F7931D',
          fillColor: '#F7931D',
          states: {
            hover: {
              fillColor: '#C7710B'
            }
          },
          onSeries: 'dataseries',
        }],

        title: {
           text: null
        },

        xAxis: {
          // categories: $scope.categories,
          type: 'datetime',
          // tickWidth: 0,
          // tickLength: 20,
        },
        func: function(chart) {
          $timeout(function(){
            chart.series[1].setVisible(false);
            updateEnergyData();

            // View functions that only make sense when data is loaded
            $scope.getMainMax = function(){
              // var chart = $scope.chartConfig.getHighcharts();
              return _.chain(chart.series[0].data).reject(function(value){return !value || !value.y}).max(function(value){return value.y}).value();
            }

            $scope.getMainMin = function(){
              // var chart = $scope.chartConfig.getHighcharts();
              return _.chain(chart.series[0].data).reject(function(value){return !value || !value.y}).min(function(value){return value.y}).value();
            }

            $scope.getMainAvg = function(){
              // var chart = $scope.chartConfig.getHighcharts();
              return _.chain(chart.series[0].data).reject(function(value){return !value || !value.y}).reduce(function(memo, value){return memo + (value ? value.y : 0)},0)/chart.series[0].data.length;
            }

            $scope.getComparedMax = function(){
              // var chart = $scope.chartConfig.getHighcharts();
              return _.chain(chart.series[1].data).reject(function(value){return !value || !value.y}).max(function(value){return value.y}).value();
            }

            $scope.getComparedMin = function(){
              // var chart = $scope.chartConfig.getHighcharts();
              return _.chain(chart.series[1].data).reject(function(value){return !value || !value.y}).min(function(value){return value.y}).value();
            }

            $scope.getComparedAvg = function(){
              // var chart = $scope.chartConfig.getHighcharts();
              return _.chain(chart.series[1].data).reject(function(value){return !value || !value.y}).reduce(function(memo, value){return memo + (value ? value.y : 0)},0)/chart.series[1].data.length;
            }
          });
        }
      }
  });

  // Helper function should be moved somewhere more general
  var padMonth = function(value) {
    return value < 10 ? '0' + value : '' + value;
  }

  // Updates the chart depending on the granularity, period, type of energy and comparison
  var updateEnergyData = function(type, granularity) {
    type = type || $scope.settings.type;
    granularity = granularity || $scope.settings.granularity;
    $scope.chartConfig.loading = true;
    var period;
    var chart = $scope.chartConfig.getHighcharts();
    var startDate = new Date($scope.settings.endDate);
    var toYear = startDate.getFullYear();
    if(type == 'electricity') {
      chart.series[0].update({color:'#5cad5c', name: $translate.instant('GRAPH_DATA_ELECTRICITY')},false);
      chart.series[1].name = 'Electricity';
    } else {
      chart.series[0].update({color:'#33b1e2', name: $translate.instant('GRAPH_DATA_HEATING')},false);
      chart.series[1].name = 'Heating & Hot watter';
    }
    if(granularity == 'yearly'){
      var fromYear = startYear;
      var current = new Date();
      // Show new year only if there are already 2 months in it
      period = fromYear + '-' + (current.getMonth() > 1 ? current.getFullYear() : current.getFullYear - 1);
    } else {
      var toMonth = padMonth(startDate.getMonth())
      startDate.setFullYear(startDate.getFullYear()-1);
      var fromYear = startDate.getFullYear();
      var fromMonth = padMonth(startDate.getMonth() + 1);
      period = fromYear + fromMonth + '-' + toYear + toMonth;
    }
    var results = [];
    results.push($scope.object.getEnergyData(type,'month',period));
    if($scope.settings.compareTo ==  "GRAPH_COMPARE_PREV_YEAR" && granularity == 'monthly'){
      period = (fromYear -1) + fromMonth + '-' + (toYear-1) + toMonth;
      results.push($scope.object.getEnergyData(type,'month',period));
    } else if($scope.settings.compareTo ==  "GRAPH_COMPARE_AVG") {
      results.push($scope.object.getAvgEnergyData(type,'month',period));
    } else {
      chart.series[1].setVisible(false);
    }
    return $q.all(results).then(function(responses){
      _.each(responses,function(response,i){
        if(granularity == 'yearly'){
          chart.series[i].setData(_.reduce(response.data,function(memo,value,index){
            if(index % 12 == 0){
              memo.push({x:Date.UTC(startYear + Math.floor(index/12),0), y:value/1});
            } else {
              memo[memo.length - 1].y += value;
            }
            return memo;
          },[]));
        } else {
          chart.series[i].setData(_.map(response.data,function(value, index){
            var date = new Date(startDate);
            date.setMonth(date.getMonth()+index)
            return { x: Date.UTC(date.getFullYear(),date.getMonth()), y:value/1}
          }));
        }
        chart.series[i].setVisible(true);
      });
      $scope.settings.type = type;
      $scope.settings.granularity = granularity;
      updateActionFlags(granularity);
      chart.redraw();
      $scope.chartConfig.loading = false;
    });
  }

  // Update action flags
  var updateActionFlags = function(granularity){
    granularity = granularity || $scope.settings.granularity;
    var data = [];
    var startDate = new Date($scope.settings.endDate);
    if(granularity == "yearly"){
      startDate.setFullYear(startYear);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    var actions = $filter('orderBy')(_.filter($scope.actions, $scope.actionFilter),'date',true);
    var length = actions.length;
    _.each(actions, function(action,index){
      var date = new Date(action.date);
      if(date < $scope.settings.endDate && date >= startDate) {
        data.push({
          x: Date.UTC(date.getFullYear(),granularity == "yearly" ? 0 : date.getMonth()),
          title: (length - index) + "",
          text: action.name
        });
      }
    });
    var chart = $scope.chartConfig.getHighcharts();
    chart.series[2].setData(data);
  }

  // Moves the chart one month forward/back
  $scope.move = function(direction) {
    var fn = direction > 0 ? _.last : _.first;
    var chart = $scope.chartConfig.getHighcharts();
    var date = new Date(fn(chart.series[0].data).x)
    date.setMonth(date.getMonth() + direction);
    var currentStartOfMonth = new Date(new Date().setDate(1)).setHours(0,0,0,0);
    if(date < currentStartOfMonth) {
      $scope.chartConfig.loading = true;
      $scope.settings.endDate.setMonth($scope.settings.endDate.getMonth() + direction);
      var period = date.getFullYear() + '' + padMonth(date.getMonth()+1);
      var results = []
      results.push($scope.object.getEnergyData($scope.settings.type,'month',period));
      if($scope.settings.compareTo ==  "GRAPH_COMPARE_PREV_YEAR"){
        period = (date.getFullYear() - 1) + '' + padMonth(date.getMonth()+1);
        results.push($scope.object.getEnergyData($scope.settings.type,'month',period));
      } else if($scope.settings.compareTo ==  "GRAPH_COMPARE_AVG") {
        results.push($scope.object.getAvgEnergyData($scope.settings.type,'month',period));
      }
      $q.all(results).then(function(responses){
        var value1 = responses[0].data;
        var value2 = responses.length == 2 ? responses[1].data : null;
        if (value1 != null) {
          if(direction > 0) {
            chart.series[0].removePoint(0,false);
            chart.series[0].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value1/1},false,false);
            chart.series[1].removePoint(0,false);
            if (value2 != null) {
              chart.series[1].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value2/1},false,false);
            }
          } else {
            chart.series[0].removePoint(11,false);
            chart.series[0].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value1/1},false,false);
            chart.series[1].removePoint(11,false);
            if (value2 != null) {
              chart.series[1].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value2/1},false,false);
            }
          }
          updateActionFlags();
          chart.redraw();
          mixpanel.track('Graph moved', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo, date: date});
        }
        $scope.chartConfig.loading = false;
      });
    }
  }

}])
.directive('civisEnergyGraph', [function(){
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      settings: '=civisEnergyGraph',
      object: '=civisEnergyGraphData',
      actions: '=civisEnergyGraphActions',
      actionFilter: '=civisEnergyGraphActionFilterFn'
    }, // {} = isolate, true = child, false/undefined = no change
    controller: 'EnergyGraphCtrl',
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: 'app/shared/energyGraphTpl.html',
    // replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {

      if(!$scope.settings) {
        throw 'Need to provide settings object to civis-energy-graph directive';
      }

      var currentDate = new Date();
      currentDate.setDate(1);
      currentDate.setHours(0)
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);

      $scope.settings.endDate = currentDate;
    }
  };
}]);
