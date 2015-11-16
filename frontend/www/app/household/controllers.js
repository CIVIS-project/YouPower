'use strict';

angular.module('civis.youpower.households', ['highcharts-ng'])

.controller('HouseholdEnergyCtrl', function($scope,$timeout,Household) {

  $scope.household = new Household($scope.currentUser.household);

  $scope.energyGraphSettings = {
    granularity: "monthly",
    type: "electricity",
    unit: "kWh",
    granularities: ['hourly','daily','monthly','yearly'],
    disabledGranularities: ['hourly','daily','yearly'],
    types: [{
      name:'hot_water',
      cssClass: 'positive'
    },{
      name:'electricity',
      cssClass: 'balanced',
      label: 'household_electricity'
    }],
  }

  $scope.$on("$ionicView.enter",function(){
    $timeout(function(){
      $scope.$broadcast('civisEnergyGraph.init');
    });
  })


})
