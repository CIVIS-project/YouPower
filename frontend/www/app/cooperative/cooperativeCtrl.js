angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope,Cooperatives) {

  Cooperatives.get({id:'55f14ce337d4bef728a861ab'},function(data){
    $scope.cooperative = data;
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
          y: -10,
          useHTML: true,
          formatter: function(){
            console.log("Entered formatter")
            if($scope.cooperative) {
              console.log("Entered formatter 2")
              var currentPeriod = this.value;
              var actionsInPeriod = _.reduce($scope.cooperative.actions,function(result, action, index){
                var date = new Date(action.date);
                if(currentPeriod.value == date.getMonth()){
                  result = result + (result.length ? ", " : "") + (index + 1);
                }
                return result;
              },"");
              return this.value.label + "<br><span class='badge badge-energized'>" + actionsInPeriod + "</span>";
            } else return this.value.label;
          }
        },

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
  });

  var energyType =[];

  monthCategories = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

  // $scope.comparisons = Comparison;

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
    }
    else{
      $scope.period = 'yearly'
    }

  }

  $scope.isActive = function(type) {
    return energyType.indexOf(type)>=0;
  }

  $scope.moveFwd = function() {

  }

  $scope.moveBwd = function() {

  }

  $scope.addAction = function(action){
    Cooperatives.addAction({id:$scope.cooperative._id},action)
  }


  // EMService.getMonthlyConcumptions('530c4de3c0fa4631158bd686','2015').then(function(data){
  //   console.log(data);
  // })

})
