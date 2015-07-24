angular.module('civis.youpower.welcome').controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, $rootScope, $state,AuthService) {

	$scope.loginData = {}
	

  // $scope.loginData.emailAddress = 'civisuser@test.com';
  // $scope.loginData.password = "test";

  // $scope.loginData.emailAddress = "testuser5@test.com";
  // $scope.loginData.password = "topsecret50";

  $scope.loginData.emailAddress = "foo";
  $scope.loginData.password = "bar";


	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

  $scope.login = function() {
    AuthService.login($scope.loginData.emailAddress, $scope.loginData.password)
    .then(function(){
      // $state.go('main.actions');
      console.log("logged in"); 
      $state.go('main.actions.yours');
    })


  }

};


