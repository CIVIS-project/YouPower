
controllers.controller('ActionsCtrl', ActionsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionsCtrl($scope, $timeout, $state, $stateParams, $filter, $ionicSlideBoxDelegate, $firebaseArray, $ionicHistory) { 

	// var ref = new Firebase("https://youpower.firebaseio.com/actions")

	// $scope.actions = $firebaseArray(ref);
	
	$scope.slideIdx = $stateParams.index ? $stateParams.index : 0; 


	$scope.nextTip = function(user) {

		if(user.actionsActive && _.size(user.actionsActive) >= user.preferredNrOfActions) {
			//do nothing
		}else{
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			//todo: choose next action
			$state.go("tab.action",{id:"0"});
		}
	}


	$scope.actionCompleted = function(action){
		$state.go("tab.action-completed",{id:action.id});
	}

	$scope.actionAbandoned = function(action){
		$state.go("tab.action-abandoned",{id:action.id});
	}


};

