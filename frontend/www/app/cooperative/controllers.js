'use strict';

angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope,$timeout,$state,$q,$stateParams,$translate,Cooperatives,currentUser) {


  var startYear = 2010;

  $scope.comparisons = [
    {name: ""},
    {name: "COOPERATIVE_COMPARE_AVG"},
    {name: "COOPERATIVE_COMPARE_PREV_YEAR"},
    // {name: "COOPERATIVE_COMPARE_PREV_YEAR_NORM"}
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
    updateEnergyData(type).then(function(){
      $scope.settings.type = type;
    });
  }

  $scope.changeGranularity = function(granularity){
    updateEnergyData($scope.settings.type,granularity).then(function(){
      $scope.settings.granularity = granularity;
    });
  }

  $scope.getCorrectDate = function(date) {
    if(date) {
      var result = new Date(date);
      if($scope.settings.compareTo == 'COOPERATIVE_COMPARE_PREV_YEAR') {
        result.setFullYear(result.getFullYear() - 1);
      }
      return result;
    }
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

  $scope.actionFilter = function(action, index) {
    var type = $scope.settings.type == 'electricity' ? 200 : 100;
    return action.types.indexOf(type) >= 0;
  }

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
              valueSuffix: " kWh/m<sup>2</sup>",
              valueDecimals: 0,
              pointFormat: '<span style="color:{point.color}">\u25CF </span><b>{point.y}</b><br/>'
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
            valueSuffix: " kWh/m<sup>2</sup>",
            valueDecimals: 2
          }
        },{
          type: 'spline',
          onSeries: 'dataseries',
          tooltip: {
            shared: true,
            valueSuffix: " kWh/m<sup>2</sup>",
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
  }

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
      chart.series[0].update({color:'#5cad5c', name: $translate.instant('COOPERATIVE_DATA_ELECTRICITY')},false);
      chart.series[1].name = 'Electricity';
    } else {
      chart.series[0].update({color:'#33b1e2', name: $translate.instant('COOPERATIVE_DATA_HEATING')},false);
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
    results.push($scope.cooperative.getEnergyData(type,'month',period));
    if($scope.settings.compareTo ==  "COOPERATIVE_COMPARE_PREV_YEAR" && granularity == 'monthly'){
      period = (fromYear -1) + fromMonth + '-' + (toYear-1) + toMonth;
      results.push($scope.cooperative.getEnergyData(type,'month',period));
    } else if($scope.settings.compareTo ==  "COOPERATIVE_COMPARE_AVG") {
      results.push($scope.cooperative.getAvgEnergyData(type,'month',period));
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
    var actions = _.filter($scope.cooperative.actions, $scope.actionFilter);
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
      results.push($scope.cooperative.getEnergyData($scope.settings.type,'month',period));
      if($scope.settings.compareTo ==  "COOPERATIVE_COMPARE_PREV_YEAR"){
        period = (date.getFullYear() - 1) + '' + padMonth(date.getMonth()+1);
        results.push($scope.cooperative.getEnergyData($scope.settings.type,'month',period));
      } else if($scope.settings.compareTo ==  "COOPERATIVE_COMPARE_AVG") {
        results.push($scope.cooperative.getAvgEnergyData($scope.settings.type,'month',period));
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
        }
        $scope.chartConfig.loading = false;
      });
    }
  }

  $scope.commentAction = function(action) {
    Cooperatives.commentAction({id:$scope.cooperative._id,actionId:action._id,comment:action.newComment},{comment:action.newComment},function(comment){
      action.comments.push(comment);
      action.commentsCount ++;
      action.newComment = undefined;

    });
  }

  $scope.loadMoreComments = function(action){
    Cooperatives.getMoreComments({id:$scope.cooperative._id,actionId:action._id,lastCommentId:_.last(action.comments)._id},function(comments){
      Array.prototype.push.apply(action.comments,comments);
    });
  }

  $scope.deleteActionComment = function(action,comment) {
    Cooperatives.deleteActionComment({id:$scope.cooperative._id,actionId:action._id,commentId:comment._id},function(){
      action.comments.splice(action.comments.indexOf(comment),1);
      action.commentsCount --;
    });
  }

})

.controller('CooperativeEditCtrl', function($scope,$state,Cooperatives,currentUser){
  $scope.ventilationTypes = Cooperatives.VentilationTypes;

  $scope.actionTypes = Cooperatives.getActionTypes();

  $scope.$on("$ionicView.enter",function(){
    // Get the cooperative, currently hardcoded
    Cooperatives.get({id:currentUser.cooperativeId},function(data){
      $scope.cooperative = data;
    });
  })

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

  $scope.deleteAction = function(action){
    Cooperatives.deleteAction({id:currentUser.cooperativeId,actionId:action._id},function(){
      $state.go("^");
    });
  }

  $scope.updateAction = function(){
    Cooperatives.updateAction({id:currentUser.cooperativeId,actionId:$scope.action._id},$scope.action,function(){
      $state.go("^");
    })
  };
})

.controller('CooperativesCtrl', function($scope, $state, Cooperatives, cooperatives) {
  $scope.cooperatives = cooperatives;

  $scope.$on("$ionicView.enter",function(){
    Cooperatives.query(function(data){
      $scope.cooperatives = data;
    });
  });

  $scope.view = 'map';

  $scope.cooperativeClick = function(id){
    $state.go("^.show",{id:id});
  };

})

.controller('CooperativesMapCtrl', function($scope, $compile, $ionicLoading, $translate) {

  function initialize() {
      var myCoop = _.findWhere($scope.cooperatives,{_id:$scope.currentUser.cooperativeId});
      var myLatlng = new google.maps.LatLng(myCoop.lat, myCoop.lng);

      var mapOptions = {
          mapTypeControl: false,
          streetViewControl: false,
          center: myLatlng,
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("map"),
          mapOptions);



      var energyClasses = {A: "009036", B:"55AB26", C:"C8D200", D:"FFED00", E:"FBBA00", F:"EB6909", G:"E2001A", unknown:"bbbbbb"};

      var energyClassPins = _.mapObject(energyClasses,function(value,key){
        return new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + value,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
      });

      angular.forEach($scope.cooperatives, function(coop) {
          //Marker + infowindow + angularjs compiled ng-click
          var contentString = "<div ng-click='cooperativeClick(\""
          + coop._id + "\")'><h5>"
          + coop.name + "</h5>"
          + "{{" + coop.performance + " | number:0}}" +" kWh/m2 <br><p>"
          + $translate.instant('COOPERATIVE_ENERGY_ACTIONS') + ": <b class='energized'>"
          + coop.actions.length + "</b></p></div>";
          var compiled = $compile(contentString)($scope);

          var infowindow = new google.maps.InfoWindow({
              content: compiled[0]
          });

          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(coop.lat, coop.lng),
              map: map,
              title: coop.name,
              icon: energyClassPins[coop.getEnergyClass()] || energyClassPins['unknown']
          });

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
          });
      })

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
