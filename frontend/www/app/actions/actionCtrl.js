
controllers.controller('ActionCtrl', ActionCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionCtrl($scope, $timeout, $state, $stateParams, $filter, $ionicSlideBoxDelegate, $firebaseArray,$ionicHistory) { 

	$scope.id = $stateParams.id;

	$scope.now = function(){
		return Date.now().toString();
	}
	

	$scope.nextTip = function(user,added) {
		$ionicHistory.nextViewOptions({
				disableBack: true
			});
		if(added && user.actionsActive && _.size(user.actionsActive) >= user.preferredNrOfActions) {
			$state.go("tab.actions");
		} else {
			//todo: choose next action
			$state.go("tab.action",{id:"99"});
		}
	}

};

