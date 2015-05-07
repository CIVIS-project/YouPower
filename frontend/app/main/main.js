'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  // TODO: load other modules selected during generation
])
.config(function ($stateProvider, $urlRouterProvider) {

  console.log('Allo! Allo from your module: ' + 'main');

  $urlRouterProvider.otherwise('/main');

  // some basic routing
  $stateProvider
    .state('main', {
      url: '/main',
      templateUrl: 'main/templates/start.html',
      controller: 'StartCtrl as start'
    });
  // TODO: do your thing
});
