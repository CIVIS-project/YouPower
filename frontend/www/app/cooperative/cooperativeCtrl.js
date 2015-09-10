angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope) {

  var energyType =[];

  monthCategories = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

  // $scope.comparisons = Comparison;

  $scope.categories = ['A','B','C','D','E','F','G','H','I','J','K']

  $scope.period = 'yearly';

  $scope.toggleType = function(type){
    if(energyType.indexOf(type)<0) {
      energyType.push(type);
    } else {
      energyType.splice(energyType.indexOf(type),1);
    }
  }
  $scope.toggleYear = function(){
    if($scope.period == 'yearly'){
      $scope.period = 'monthly'
      $scope.chartConfig.xAxis.categories = ['A','B','C','D','E','F','G','H','I','J','K']
    }
    else{
      $scope.period = 'yearly'
      $scope.chartConfig.xAxis.categories =
      }

  }

  $scope.isActive = function(type) {
    return energyType.indexOf(type)>=0;
  }

  $scope.moveFwd = function() {

  }

  $scope.moveBwd = function() {

  }

  //This is not a highcharts object. It just looks a little like one!
  $scope.chartConfig = {

    options: {
        //This is the Main Highcharts chart config. Any Highchart options are valid here.
        //will be overriden by values specified below.
        chart: {
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

    //Series object (optional) - a list of series using normal highcharts series options.
    series: [{
       data: [85, 91, 81, 70, 64, 50, 41, 53, 60, 89, 82, 94],
       // pointPadding: 0.001,
       groupPadding: 0.01
    },{
      data:  [81, 92, 84, 75, 61, 55, 42, 58, 62, 81, 87, 91],
      type: 'spline'
    }],
    //Title configuration (optional)
    title: {
       text: null
    },
    //Boolean to control showng loading status on chart (optional)
    //Could be a string if you want to show specific loading text.
    loading: false,
    //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
    //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
    xAxis: {
      categories: $scope.categories,
      tickWidth: 0,
      tickLength: 20,
      labels: {
        y: -10
      }
    },
    //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
    useHighStocks: false,
    //size (optional) if left out the chart will default to size of the div or something sensible.
    size: {
     width: 400,
     height: 300
    },
    //function (optional)
    func: function (chart) {
     //setup some logic for the chart
    }
  };
  // EMService.getMonthlyConcumptions('530c4de3c0fa4631158bd686','2015').then(function(data){
  //   console.log(data);
  // })

})
