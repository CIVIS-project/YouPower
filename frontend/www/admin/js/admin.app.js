angular.module('civis.youpower',[])
angular.module('civis.youpower.admin', [
  'ui.router',
  'civis.youpower'
])

.run(function($rootScope, $location, $state, AuthService) {

  $rootScope.$on( '$stateChangeStart', function(e, toState  , toParams, fromState, fromParams) {

    var isLogin = toState.name === "login";
    AuthService.isAdmin().then(function(){
      if(isLogin) {
        e.preventDefault();
        $state.go('main');
      }
    },function(){
      if(!isLogin){
        e.preventDefault();
        $state.go('login');
      }
    })
  });

  $rootScope.$on('$stateChangeError', function(event, next, nextParams, fromState, fromParams, error) {
    console.error("State Change error occurred!");
    console.error(arguments);
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  $stateProvider

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "AdminLoginController"
  })

  .state('main',{
    url: "",
    templateUrl: "templates/main.html",
    controller: "MainController",
  })

  .state('main.smappee', {
    url: "/smappee",
    controller: "SmappeeUsersController",
    templateUrl: "templates/smappee.html"
  })

  //$urlRouterProvider.otherwise('/app/actions/yours');
  $urlRouterProvider.otherwise('');

})

.controller('AdminLoginController', function ($scope, $state, AuthService) {

  $scope.loginData = {};

  $scope.signin = function() {

    AuthService.loginAdmin($scope.loginData.email.toLowerCase(), $scope.loginData.password)
    .then(function(data){

      $state.go('main');

    }, function(err){

      //TODO show error
    })
  }

})

.controller('MainController',function($scope, $state, AuthService){
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  }
})

.controller('SmappeeUsersController', function($scope,$http,Config) {
  $http.get(Config.host + '/api/admin/users/smappee').then(function(response){
    $scope.smappeeUsers = response.data;
  })

})



