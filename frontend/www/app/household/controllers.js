'use strict';

angular.module('civis.youpower.households', ['highcharts-ng'])

.controller('HouseholdEnergyCtrl', function($scope,Household) {

  $scope.household = new Household();
  $scope.household._id = 'demo';

  $scope.energyGraphSettings = {
    granularity: "monthly",
    type: "electricity",
    unit: "kWh",
    granularities: ['hourly','daily','monthly','yearly'],
  }

  $scope.$on("$ionicView.enter",function(){
    $scope.$broadcast('civisEnergyGraph.init');
  })


})
