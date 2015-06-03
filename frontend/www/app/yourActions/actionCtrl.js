
controllers.controller('ActionCtrl', ActionCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionCtrl($scope, $timeout, $state, $stateParams, $filter, $ionicSlideBoxDelegate, $firebaseArray) { 

	var user;

	$scope.id = $stateParams.id;

	$scope.init = function(u) {
		user = u;
	}

	$scope.now = function(){
		return Date.now().toString();
	}

	$scope.nextTip = function(added) {
		if(added && user.actionsActive && _.size(user.actionsActive) >= user.preferredNrOfActions -1) {
			$state.go("tab.actions");
		} else {
			$state.go("tab.action",{id:"99"});
		}
	}

};

