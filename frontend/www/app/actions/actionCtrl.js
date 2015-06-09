
controllers.controller('ActionCtrl', ActionCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionCtrl($scope, $timeout, $state, $stateParams, $filter, $ionicSlideBoxDelegate, $firebaseArray,$ionicHistory) { 

	$scope.id = $stateParams.id;

	$scope.now = function(){
		return Date.now().toString();
	}

};

