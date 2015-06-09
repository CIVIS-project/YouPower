controllers.controller('TabsCtrl', TabsCtrl);


function TabsCtrl($rootScope) {

	$scope.emailAddress = "jmayer@energyup.eu";
	
	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

	$scope.setCurrentUser = function(user) {
		$rootScope.currentUser = user; 
	}

	$scope.takeActions =function() {

		console.log($rootScope.currentUser.preferredNrOfActions);

		//if $rootScope.currentUser
	}

}; 