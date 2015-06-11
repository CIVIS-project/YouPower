controllers.controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, $rootScope, $state) {

	$scope.emailAddress = "";
	// $scope.emailAddress = "jmayer@energyup.eu";
	
	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

	$scope.setCurrentUser = function(user) {
		$rootScope.currentUser = user; 
	}

	$scope.takeActions =function() {

		console.log($rootScope.currentUser.preferredNrOfActions);

		//$state.go('todo.details', { id: $scope.todos[0].Id });

		$state.go('tab.actions');
	}

}; 


