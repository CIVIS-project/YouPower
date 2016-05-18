angular.module('civis.youpower')

.controller('EnergyGraphCtrl', ['$scope','$timeout','$q','$translate','$filter', '$ionicPopup', function($scope,$timeout,$q,$translate,$filter,$ionicPopup){

  var startYear = 2010;

  $scope.changeComparison = function(){
    updateEnergyData().then(function(){
      mixpanel.track('Graph filtered', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo});
    });
  };

  //Lists the possible comparison options in a pop-up
  $scope.listComparisons = function() {
    var  currentCompareTo = $scope.settings.compareTo;
    var  currentSelectedCooperative =  $scope.settings.selectedCooperative;
    var compareToPopUp = $ionicPopup.show({
      scope: $scope,
      title: $translate.instant('GRAPH_DATA_COMPARE'),
      templateUrl: 'app/cooperative/compareToPopUp.html',
      cssClass:'popup-custom',
      buttons: [{
        text: 'OK',
        type: 'button-clear popup-button'
      }]
    });
    compareToPopUp.then(function(res) {
      if(currentCompareTo != $scope.settings.compareTo ||
         currentSelectedCooperative != $scope.settings.selectedCooperative){
        $scope.changeComparison();
      }
    });
  };

  $scope.toggleCooperatives = function() {
    if($scope.areCooperativesShown()){
      $scope.showCooperatives = false;
    }else{
      $scope.showCooperatives = true;
    }
  }
  $scope.areCooperativesShown = function() {
    return $scope.showCooperatives == true;
  }

  $scope.changeType = function(type){
      updateEnergyData(type).then(function(){
      $scope.settings.type = type;
      mixpanel.track('Graph filtered', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo});
    });
  }

  $scope.changeCategory = function(type){
    $scope.categories.type = type;
  };

  //show popup for selecting the different Categories (settings.types)
  $scope.listCategories = function() {
    $scope.categories = $scope.settings.types;
    $scope.categories.type = $scope.settings.type;

    var categoryPopUp = $ionicPopup.show({
      scope: $scope,
      title: $translate.instant('GRAPH_DATA_CATEGORY'),
      templateUrl: 'app/cooperative/categoriesPopUp.html',
      cssClass:'popup-custom',
      buttons: [{
        text: 'OK',
        type: 'button-clear popup-button',
        onTap: function(e) {
          // Returning a value will cause the promise to resolve with the given value.
          return $scope.categories.type;
        }
      }]
    });
    categoryPopUp.then(function(res) {
      $scope.changeType(res);
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

  //Difference in months between 2 dates
  function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  $scope.$on("goToActionInGraph", function (event, args) {
    if ($scope.granularity != 'yearly'){
      var action = _.find($scope.actions, function(action){ return action._id == args.actionId});
      var date = new Date(action.date);
      var currentDate = new Date();
      if (monthDiff(date,currentDate) > 5){
        date.setMonth(date.getMonth() + 7);
        $scope.settings.endDate = date;
      }else{
        var currentDate = new Date();
        currentDate.setDate(1);
        currentDate.setHours(0)
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);
        $scope.settings.endDate = currentDate;
      }
      updateEnergyData();
    }
  });

  // Sets the initial chart configuration
  $scope.$on('civisEnergyGraph.init', function(event) {
    if($scope.chartConfig) {
      return;
    }
    $scope.chartLoaded = false;
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
              align: 'right',
              verticalAlign: 'top',
              layout: 'horizontal',
              x: 0,
              y: -15,
              floating: true,
              labelFormatter: function () {
                if ($scope.settings.compareTo === "Housing_Cooperatives") {
                  return $scope.settings.selectedCooperative.name;
                } else {
                  return $translate.instant($scope.settings.compareTo);
                }
              }
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
          showInLegend: false,
          groupPadding: 0.01,
          onSeries: 'dataseries',
          name: 'prueba',
          tooltip: {
            shared: true,
            valueSuffix: " " + $scope.settings.unit,
            valueDecimals: 2
          },
          dataLabels: {
            crop: false,
            allowOverlap: true,
            format: '{point.y:,.2f}',
            color:'#006633',
            style: {
              fontWeight: 'bold',
              fontSize: '12px'
            },
            overflow: 'none'
          },
        },{
          type: 'spline',
          onSeries: 'dataseries',
          tooltip: {
            shared: true,
            valueSuffix: " " + $scope.settings.unit,
            valueDecimals: 2,
          },
          dataLabels: {
            crop: false,
            allowOverlap: true,
            format: '{point.y:,.2f}',
            color:'#000000',
            style: {
              fontWeight: 'bold',
              fontSize: '12px'
            },
            textShadow: false,
            //shadow: true,
            overflow: 'none',
            verticalAlign: 'below'
          }
        },{
          showInLegend: false,
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
            $scope.chartLoaded = true;
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
    var toYear = startDate.getMonth() == 0 ? startDate.getFullYear() - 1 : startDate.getFullYear();
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
      period = fromYear + '-' + (current.getMonth() >= 1 ? current.getFullYear() : current.getFullYear() - 1);
    } else {
      var toMonth = padMonth(startDate.getMonth() || 12)
      startDate.setFullYear(startDate.getFullYear()-1);
      var fromYear = startDate.getFullYear();
      var fromMonth = padMonth(startDate.getMonth() + 1);
      period = fromYear + fromMonth + '-' + toYear + toMonth;
    }
    var results = [];
    results.push($scope.object.getEnergyData(type,'month',period));

    //Get the data for comparison
    if($scope.settings.compareTo ==  "GRAPH_COMPARE_PREV_YEAR" && granularity == 'yearly'){
      $scope.settings.compareTo = "GRAPH_COMPARE_AVG";
    }
    if($scope.settings.compareTo ==  "GRAPH_COMPARE_PREV_YEAR" && granularity == 'monthly'){
      period = (fromYear -1) + fromMonth + '-' + (toYear-1) + toMonth;
      results.push($scope.object.getEnergyData(type,'month',period));
    } else if($scope.settings.compareTo ==  "GRAPH_COMPARE_AVG") {
      results.push($scope.object.getAvgEnergyData(type,'month',period));
    } else if($scope.settings.compareTo ==  "Housing_Cooperatives"){
      results.push($scope.object.getEnergyDataFromCooperative(type,'month',period,$scope.settings.selectedCooperative._id));
    } else {
      $scope.settings.compareTo = "GRAPH_COMPARE_AVG"
      //chart.series[1].setVisible(false);
    }

    return $q.all(results).then(function(responses){
      _.each(responses,function(response,i){
        if(granularity == 'yearly'){
          chart.series[i].setData(_.reduce(response.data,function(memo,value,index){
            if(index % 12 == 0){{}
              memo.push({x:Date.UTC(startYear + Math.floor(index/12),0), y:value/1 , dataLabels: {} });
            } else {
              memo[memo.length - 1].y += value;
            }
            return memo;
          },[]),false);
        } else {
          chart.series[i].setData(_.map(response.data,function(value, index){
            var date = new Date(startDate);
            date.setMonth(date.getMonth()+index)
            return { x: Date.UTC(date.getFullYear(),date.getMonth()), y:value/1, dataLabels: {}}
          }),false);
        }
        chart.series[i].setVisible(true);
      });


      $scope.settings.type = type;
      $scope.settings.granularity = granularity;
      updateActionFlags(granularity);
      updateMinAndMaxValues(type);
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

  //Update series' max and min values
  var updateMinAndMaxValues = function(type){
    type = type || $scope.settings.type;
    var chart = $scope.chartConfig.getHighcharts();
    _.each(chart.series[0].data, function(value){ return value.dataLabels.enabled = false; });
    _.each(chart.series[1].data, function(value){ return value.dataLabels.enabled = false; });

    //Get values
    var mainMax = _.chain(chart.series[0].data).reject(function(value){return !value || !value.y}).max(function(value){return value.y}).value();
    var mainMin = _.chain(chart.series[0].data).reject(function(value){return !value || !value.y}).min(function(value){return value.y}).value();
    var comparedMax = _.chain(chart.series[1].data).reject(function(value){return !value || !value.y}).max(function(value){return value.y}).value();
    var comparedMin = _.chain(chart.series[1].data).reject(function(value){return !value || !value.y}).min(function(value){return value.y}).value();

    var optMainMax = chart.series[0].data[mainMax.index].options;
    var optMainMin = chart.series[0].data[mainMin.index].options;
    var optComparedMax = chart.series[1].data[comparedMax.index].options;
    var optComparedMin = chart.series[1].data[comparedMin.index].options;

    optMainMax.dataLabels.enabled = true;
    optMainMin.dataLabels.enabled = true;
    optComparedMax.dataLabels.enabled = true;
    optComparedMin.dataLabels.enabled = true;

    if (type != 'electricity'){
      optMainMax.dataLabels.color = '#0099cc';
      optMainMin.dataLabels.color = '#0099cc';
    }
    chart.series[0].data[mainMax.index].update(optMainMax);
    chart.series[0].data[mainMin.index].update(optMainMin);
    chart.series[1].data[comparedMax.index].update(optComparedMax);
    chart.series[1].data[comparedMax.index].update(optComparedMax);
  };

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
      } else if($scope.settings.compareTo ==  "Housing_Cooperatives"){
      results.push($scope.object.getEnergyDataFromCooperative($scope.settings.type,'month',period,$scope.settings.selectedCooperative._id));
      }
      $q.all(results).then(function(responses){
        var value1 = responses[0].data;
        var value2 = responses.length == 2 ? responses[1].data : null;
        if (value1 != null) {
          if(direction > 0) {
            chart.series[0].removePoint(0,false);
            chart.series[0].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value1/1, dataLabels: {} },false,false);
            chart.series[1].removePoint(0,false);
            if (value2 != null) {
              chart.series[1].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value2/1, dataLabels: {} },false,false);
            }
          } else {
            chart.series[0].removePoint(11,false);
            chart.series[0].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value1/1, dataLabels: {} },false,false);
            chart.series[1].removePoint(11,false);
            if (value2 != null) {
              chart.series[1].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value2/1, dataLabels: {} },false,false);
            }
          }
          updateActionFlags();
          updateMinAndMaxValues();
          chart.redraw();
          mixpanel.track('Graph moved', {granularity: $scope.settings.granularity, type: $scope.settings.type, compareTo: $scope.settings.compareTo, date: date});
        }
        $scope.chartConfig.loading = false;
      });
    }
  }

  $scope.hasMoreData = function(direction) {
    if($scope.chartLoaded) {
      var fn = direction > 0 ? _.last : _.first;
      var chart = $scope.chartConfig.getHighcharts();
      if(fn(chart.series[0].data)){
        var date = new Date(fn(chart.series[0].data).x)
        date.setMonth(date.getMonth() + direction);
        var currentStartOfMonth = new Date(new Date().setDate(1)).setHours(0,0,0,0);
        return date < currentStartOfMonth && fn(chart.series[0].data).y;
      }
    }
    return false;
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
      actionFilter: '=civisEnergyGraphActionFilterFn',
      cooperatives: '=civisEnergyGraphCooperatives'
    }, // {} = isolate, true = child, false/undefined = no change
    controller: 'EnergyGraphCtrl',
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: '/app/shared/energyGraphTpl.html',
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
