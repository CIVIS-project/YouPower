'use strict';

angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope,$timeout,$state,$q,$stateParams,Cooperatives,currentUser) {


  var startYear = 2010;

  $scope.comparisons = [
    {name: ""},
    {name: "similar cooperatives (average)"},
    {name: "previous year"},
    {name: "previous year (normalized)"}
  ]

  var currentDate = new Date();
  currentDate.setDate(1);
  currentDate.setHours(0)
  currentDate.setMinutes(0);
  currentDate.setSeconds(0);
  currentDate.setMilliseconds(0);

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

  $scope.actionTypes = Cooperatives.getActionTypes();

  $scope.$on("$ionicView.enter",function(){
    var id = $stateParams.id || currentUser.cooperativeId;
    // Get the cooperative, currently hardcoded
    Cooperatives.get({id:id},function(data){
      $scope.cooperative = data;
      $scope.cooperative.actions = _.sortBy($scope.cooperative.actions,function(a){ return new Date(a.date)}).reverse();
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
            tooltip: {
              shared: true,
              valueSuffix: " MWh",
              valueDecimals: 2,
            },
        },

        //The below properties are watched separately for changes.
        series: [{
          data: data,
          // pointPadding: 0.001,
          groupPadding: 0.01,
          onSeries: 'dataseries',
          tooltip: {
            shared: true,
            valueSuffix: " MWh",
            valueDecimals: 2
          }
        },{
          type: 'spline',
          onSeries: 'dataseries',
          tooltip: {
            shared: true,
            valueSuffix: " MWh",
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
    if($scope.settings.type == 'electricity') {
      chart.series[0].name = 'Electricity';
      chart.series[1].name = 'Electricity';
    } else {
      chart.series[0].name = 'Heating & Hot watter';
      chart.series[1].name = 'Heating & Hot watter';
    }
    if($scope.settings.granularity == 'yearly'){
      var fromYear = startYear;
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
              var date = new Date(startYear + Math.floor(index/12),1,1);
              memo.push({x:date, y:value});
            } else {
              memo[memo.length - 1].y += value;
            }
            return memo;
          },[]));
        } else {
          chart.series[i].setData(_.map(data.data.data[0].periods[0].energy,function(value, index){
            var date = new Date(startDate);
            date.setMonth(date.getMonth()+index)
            return { x: Date.UTC(date.getFullYear(),date.getMonth()), y:value/1000}
          }));
        }
        chart.series[i].setVisible(true);
      });
      updateActionFlags();
      chart.redraw();
      $scope.chartConfig.loading = false;
    });
  }

  // Update action flags
  var updateActionFlags = function(){
    var data = [];
    var startDate = new Date($scope.settings.endDate);
    if($scope.settings.granularity == "yearly"){
      startDate.setFullYear(startYear);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    var counter = 0;
    _.each($scope.cooperative.actions, function(action){
      var date = new Date(action.date);
      if(date < $scope.settings.endDate && date >= startDate) {
        action.flag = ++counter;
        data.push({
          x: Date.UTC(date.getFullYear(),date.getMonth()),
          title: counter,
          text: action.name
        });
      } else {
        action.flag = null;
      }
    });
    var chart = $scope.chartConfig.getHighcharts();
    console.log("End date", $scope.settings.endDate, "Data", data);
    chart.series[2].setData(data);
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
          chart.series[0].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value1/1000},false,false);
          chart.series[1].removePoint(0,false);
          if (value2 != null) {
            chart.series[1].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value2/1000},false,false);
          }
        } else {
          chart.series[0].removePoint(11,false);
          chart.series[0].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value1/1000},false,false);
          chart.series[1].removePoint(11,false);
          if (value2 != null) {
            chart.series[1].addPoint({x:Date.UTC(date.getFullYear(),date.getMonth()),y:value2/1000},false,false);
          }
        }
        updateActionFlags();
        chart.redraw();
      }
      $scope.chartConfig.loading = false;
    });
  }

})

.controller('CooperativeEditCtrl', function($scope,$state,Cooperatives,currentUser){
  $scope.actionTypes = Cooperatives.getActionTypes();

  $scope.$on("$ionicView.enter",function(){
    // Get the cooperative, currently hardcoded
    Cooperatives.get({id:currentUser.cooperativeId},function(data){
      $scope.cooperative = data;
    });
  })

  $scope.deleteAction = function(action){
    Cooperatives.deleteAction({id:$scope.cooperative._id,actionId:action._id},function(){
      $scope.cooperative.actions.splice($scope.cooperative.actions.indexOf(action),1);
    });
  }

  $scope.save = function(){
    Cooperatives.update({id:$scope.cooperative._id},$scope.cooperative,function(){
      $state.go("^");
    })
  }

})

.factory('CooperativeActionTypePopup', function($ionicPopup){
  return function($scope){
    _.each($scope.actionTypes,function(type){
      type.selected = false;
    })
    _.each($scope.action.types,function(id){
      $scope.actionTypes.getById(id).selected = true;
    });
    $ionicPopup.show({
      templateUrl: "app/cooperative/actionTypes.html",
      scope: $scope,
      buttons: [{
        text: "Cancel"
      },{
        text: "OK",
        type: 'button-positive',
        onTap: function(e){
          // Disable subactions if parent not selected
          _.each($scope.actionTypes,function(type){
            if(type.parent && !$scope.actionTypes.getById(type.parent).selected) {
              type.selected = false;
            }
          })
          // Assign selected types to action
          $scope.action.types = _.map(_.where($scope.actionTypes,{selected:true}),function(type){return type.id});
        }
      }]
    });
  }
})

.controller('CooperativeActionAddCtrl', function($scope,$state,CooperativeActionTypePopup,Cooperatives,currentUser){
  $scope.action = {};

  $scope.actionTypes = Cooperatives.getActionTypes();

  $scope.selectActionType = function(){
    CooperativeActionTypePopup($scope);
  }

  $scope.addAction = function(){
    Cooperatives.addAction({id:currentUser.cooperativeId},$scope.action,function(){
      $state.go("^");
    })
  };
})

.controller('CooperativeActionUpdateCtrl', function($scope,$state,$stateParams,CooperativeActionTypePopup,Cooperatives,currentUser){

  $scope.actionTypes = Cooperatives.getActionTypes();

  $scope.selectActionType = function(){
    CooperativeActionTypePopup($scope);
  }

  Cooperatives.get({id:currentUser.cooperativeId},function(data){
    $scope.action = _.findWhere(data.actions,{_id:$stateParams.id});
    $scope.action.date = new Date($scope.action.date);
  });


  $scope.updateAction = function(){
    Cooperatives.updateAction({id:currentUser.cooperativeId,actionId:$scope.action._id},$scope.action,function(){
      $state.go("^");
    })
  };
})

.controller('CooperativesCtrl', function($scope, cooperatives) {
  $scope.cooperatives = cooperatives;

  $scope.view = 'map';

})

.controller('CooperativesMapCtrl', function($scope, $compile, $ionicLoading) {

  function initialize() {
      var myCoop = _.findWhere($scope.cooperatives,{_id:$scope.currentUser.cooperativeId});
      var myLatlng = new google.maps.LatLng(myCoop.lat, myCoop.lng);

      var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("map"),
          mapOptions);

      //Marker + infowindow + angularjs compiled ng-click
      var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
      var compiled = $compile(contentString)($scope);

      var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
      });

      var energyClasses = {A: "009036", B:"55AB26", C:"C8D200", D:"FFED00", E:"FBBA00", F:"EB6909", G:"E2001A"};

      var energyClassPins = _.mapObject(energyClasses,function(value,key){
        return new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + value,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
      });

      angular.forEach($scope.cooperatives, function(coop) {
          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(coop.lat, coop.lng),
              map: map,
              title: coop.name,
              icon: energyClassPins[coop.energyClass]
          });
      })

      // google.maps.event.addListener(marker, 'click', function() {
      //   infowindow.open(map,marker);
      // });

      $scope.map = map;
  }
  ionic.Platform.ready(initialize);

  $scope.centerOnMe = function() {
      if (!$scope.map) {
          return;
      }

      $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
      }, function(error) {
          alert('Unable to get location: ' + error.message);
      });
  };

  $scope.clickTest = function() {
      alert('Example of infowindow with ng-click')
  };

})
