'use strict';

angular.module('civis.youpower.cooperatives', ['highcharts-ng'])

.controller('CooperativeCtrl', function($scope,$timeout,$state,$q,$stateParams,$translate,$ionicPopup,Cooperatives,currentUser) {

  $scope.actionTypes = Cooperatives.getActionTypes();

  $scope.$on("$ionicView.enter",function(){
    var id = $stateParams.id || currentUser.cooperativeId;
    // Get the cooperative, currently hardcoded
    Cooperatives.get({id:id},function(data){
      $scope.cooperative = data;
      $scope.cooperative.actions = _.sortBy($scope.cooperative.actions,function(a){ return new Date(a.date)}).reverse();
      $scope.$broadcast('civisEnergyGraph.init');
      mixpanel.track('Cooperative viewed',{name: data.name, own: id == currentUser.cooperativeId});
    });
  })

  $scope.energyGraphSettings = {
    granularity: "monthly",
    compareTo: "",
    type: "electricity",
    unit: "kWh/m<sup>2</sup>",
    granularities: ['monthly','yearly'],
    types: [{
      name:'heating',
      cssClass: 'positive'
    },{
      name:'electricity',
      cssClass: 'balanced'
    }],
    comparisons: [
      {name: ""},
      {name: "GRAPH_COMPARE_AVG"},
      {name: "GRAPH_COMPARE_PREV_YEAR"},
      // {name: "COOPERATIVE_COMPARE_PREV_YEAR_NORM"}
    ]
  }

  $scope.performanceYear = new Date();
  $scope.performanceYear.setFullYear($scope.performanceYear.getFullYear()-1);

  $scope.actionFilter = function(action, index) {
    var type = $scope.energyGraphSettings.type == 'electricity' ? 200 : 100;
    return action.types.indexOf(type) >= 0;
  }

  $scope.commentAction = function(action) {
    Cooperatives.commentAction({id:$scope.cooperative._id,actionId:action._id,comment:action.newComment},{comment:action.newComment},function(comment){
      action.comments.push(comment);
      action.commentsCount ++;
      action.newComment = undefined;
      mixpanel.track('Cooperative Action Comment added',{'action name': action.name, 'action id': action._id});
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
      mixpanel.track('Cooperative Action Comment deleted',{'action name': action.name, 'action id': action._id});
    });
  }

  $scope.performanceInfo = function() {
    $ionicPopup.alert({
      title: $translate.instant('COOPERATIVE_PERFORMANCE'),
      template: $translate.instant('COOPERATIVE_PERFORMANCE_DESCRIPTION',{year: $scope.performanceYear, value: $scope.cooperative.performance}),
    })
  }

  $scope.trackActionClicked = function(action) {
    mixpanel.track('Cooperative Action expanded',{'action name': action.name, 'action id': action._id});
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
      mixpanel.track('Cooperative updated',{id:$scope.cooperative._id, name:$scope.cooperative.name});
    })
  }

})

.factory('CooperativeActionTypePopup', function($ionicPopup, $translate){
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
      title: $translate.instant('COOPERATIVE_ACTION_TYPE'),
      cssClass: 'popup-flexible',
      buttons: [{
        text: $translate.instant("Cancel")
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
      mixpanel.track('Cooperative Action added',$scope.action);
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
      mixpanel.track('Cooperative Action deleted',{id:action._id, name:action.name});
    });
  }

  $scope.updateAction = function(){
    Cooperatives.updateAction({id:currentUser.cooperativeId,actionId:$scope.action._id},$scope.action,function(){
      $state.go("^");
      mixpanel.track('Cooperative Action updated',{id:$scope.action._id, name:$scope.action.name});
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

      var infowindow = new google.maps.InfoWindow();

      angular.forEach($scope.cooperatives, function(coop) {
          //Marker + infowindow + angularjs compiled ng-click
          var contentString = "<div ng-click='cooperativeClick(\""
          + coop._id + "\")'><h5>"
          + coop.name + "</h5>"
          + "{{" + coop.performance + " | number:0}}" +" kWh/m2 <br><p>"
          + $translate.instant('COOPERATIVE_ENERGY_ACTIONS') + ": <b class='energized'>"
          + coop.actions.length + "</b></p></div>";
          var compiled = $compile(contentString)($scope);

          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(coop.lat, coop.lng),
              map: map,
              title: coop.name,
              icon: energyClassPins[coop.getEnergyClass()] || energyClassPins['unknown']
          });

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(compiled[0]);
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
