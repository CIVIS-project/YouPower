controllers.controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, $rootScope) {

	$scope.emailAddress = "jmayer@youpower.eu";
	
	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

	$scope.setCurrentUser = function(user) {
		$rootScope.currentUser = user; 

	}

}; 