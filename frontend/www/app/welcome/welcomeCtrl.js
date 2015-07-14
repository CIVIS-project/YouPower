angular.module('civis.youpower.welcome').controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, $rootScope, $state,AuthService) {

	$scope.loginData = {}
	// $scope.emailAddress = "jmayer@energyup.eu";

	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

  $scope.login = function() {
    AuthService.login($scope.loginData.emailAddress, $scope.loginData.password)
    .then(function(){
      $state.go('main.actions');
    })
  }

};


