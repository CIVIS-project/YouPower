
controllers.controller('ActionsCtrl', ActionsCtrl); 

// Inject my dependencies
//SettingsCtrl.$inject = ['$scope', '$filter', '$translate'];

function ActionsCtrl($scope, $timeout, $state, $filter, $ionicSlideBoxDelegate, $firebaseArray) { 

	var ref = new Firebase("https://youpower.firebaseio.com/actions")

	$scope.actions = $firebaseArray(ref);
	
	$scope.slideIdx = 0; 

	$scope.action; 

	$scope.scale = 5; 

	$scope.setSlideIdx = function(i) {
		$scope.slideIdx = i; 
		$timeout( function() {
			$ionicSlideBoxDelegate.slide($scope.slideIdx);
		}, 50 );
	};

	$scope.next = function() {
		$ionicSlideBoxDelegate.next();
	};

	$scope.getNumber = function(num) {
	    return new Array(num);   
	}

	$scope.actionCompleted = function(action, actionDone){
		//$scope.actionCanceled = !$scope.actionDone; 

		if(actionDone){
			$scope.action = action; 
			$state.go("tab.action-completed",{id:action.id});
		}
	}


};

